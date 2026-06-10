require('dotenv').config();
const mongoose = require('mongoose');

// Define source schemas (old codebase structure)
const sourceUserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: { type: String, default: '123456' },
    avatar: { url: String, public_id: String },
    background: { url: String, public_id: String },
    role: String,
    following: [mongoose.Schema.Types.ObjectId],
    favorites: [mongoose.Schema.Types.ObjectId]
}, { collection: 'users' });

const sourceMusicSchema = new mongoose.Schema({
    song_name: String,
    artist: String,
    image: { url: String, public_id: String },
    file: { url: String, public_id: String },
    uploader: mongoose.Schema.Types.ObjectId,
    likes: [mongoose.Schema.Types.ObjectId],
    countPlay: Number
}, { collection: 'musics' });

// Define target schemas (new codebase structure matching database.md)
const User = require('../src/models/User');
const Song = require('../src/models/Song');
const Follow = require('../src/models/Follow');
const Playlist = require('../src/models/Playlist');

const sourceURI = 'mongodb://sanghuynhkuro:sanhok2004@ac-rju1bdq-shard-00-00.d5qeymc.mongodb.net:27017,ac-rju1bdq-shard-00-01.d5qeymc.mongodb.net:27017,ac-rju1bdq-shard-00-02.d5qeymc.mongodb.net:27017/music_personal?ssl=true&replicaSet=atlas-12frx0-shard-0&authSource=admin&appName=Cluster0';
const targetURI = process.env.MONGO_URI;

async function seed() {
    console.log('Starting migration and seeding...');

    // 1. Connect to source database and fetch records
    console.log('Connecting to source database...');
    const sourceConn = await mongoose.createConnection(sourceURI).asPromise();
    const SourceUser = sourceConn.model('SourceUser', sourceUserSchema);
    const SourceMusic = sourceConn.model('SourceMusic', sourceMusicSchema);

    console.log('Fetching users and songs from source...');
    const sourceUsers = await SourceUser.find().lean();
    const sourceMusics = await SourceMusic.find().lean();
    console.log(`Found ${sourceUsers.length} users and ${sourceMusics.length} songs in source.`);

    // 2. Connect to target database
    console.log('Connecting to target database...');
    await mongoose.connect(targetURI);
    
    // Clear target collections
    console.log('Cleaning target database...');
    await User.deleteMany({});
    await Song.deleteMany({});
    await Follow.deleteMany({});
    await Playlist.deleteMany({});

    // 3. Migrate Users
    console.log('Migrating users...');
    const artistIds = new Set(sourceMusics.map(m => m.uploader?.toString()).filter(Boolean));

    const migratedUsers = [];
    for (const u of sourceUsers) {
        // Promote to artist if they have uploaded music in the old system
        let role = u.role || 'user';
        if (artistIds.has(u._id.toString())) {
            role = 'artist';
        }

        const newUser = new User({
            _id: u._id,
            username: u.username || 'User_' + u._id.toString().substring(18),
            email: u.email,
            password: u.password || '123456',
            avatar: u.avatar || { url: '', public_id: '' },
            background: u.background || { url: '', public_id: '' },
            role: role,
            favoriteSongs: u.favorites || [],
            followingArtists: u.following || []
        });

        await newUser.save();
        migratedUsers.push(newUser);
    }
    console.log(`Successfully migrated ${migratedUsers.length} users.`);

    // 4. Migrate Songs
    console.log('Migrating songs...');
    let migratedSongsCount = 0;
    for (const m of sourceMusics) {
        // Verify uploader exists
        const uploaderExists = migratedUsers.some(u => u._id.toString() === m.uploader?.toString());
        if (!uploaderExists) {
            console.log(`Skipping song ${m.song_name} as uploader ${m.uploader} does not exist`);
            continue;
        }

        const newSong = new Song({
            _id: m._id,
            title: m.song_name,
            artist: m.artist || 'Unknown Artist',
            genre: 'Pop', // default genre
            description: 'Migrated from reference database',
            imageUrl: m.image || { url: '', public_id: '' },
            audioUrl: m.file || { url: '', public_id: '' },
            uploadedBy: m.uploader,
            likes: m.likes || [],
            playCount: m.countPlay || 0,
            duration: 180 // default 3 minutes duration
        });

        await newSong.save();
        migratedSongsCount++;
    }
    console.log(`Successfully migrated ${migratedSongsCount} songs.`);

    // 5. Create default Admin account if not exists
    const adminEmail = 'admin@gmail.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
        console.log('Seeding default Admin account...');
        const adminUser = new User({
            username: 'Administrator',
            email: adminEmail,
            password: 'adminpassword',
            role: 'admin'
        });
        await adminUser.save();
        console.log('Seeded admin account with credentials admin@gmail.com / adminpassword');
    }

    // 6. Create default User account for quick login testing
    const testUserEmail = 'user@gmail.com';
    const testUserExists = await User.findOne({ email: testUserEmail });
    if (!testUserExists) {
        console.log('Seeding default Test User account...');
        const testUser = new User({
            username: 'John Doe',
            email: testUserEmail,
            password: 'userpassword',
            role: 'user'
        });
        await testUser.save();
        console.log('Seeded test user account with credentials user@gmail.com / userpassword');
    }

    // 7. Seed one test playlist for the test user
    const testUser = await User.findOne({ email: testUserEmail });
    if (testUser) {
        console.log('Seeding test playlist...');
        const randomSongs = await Song.find().limit(3);
        const playlist = new Playlist({
            name: 'My Summer Vibes',
            user: testUser._id,
            songs: randomSongs.map(s => s._id)
        });
        await playlist.save();
        console.log(`Seeded test playlist "${playlist.name}" with ${randomSongs.length} songs.`);
    }

    // Close connections
    await sourceConn.close();
    await mongoose.connection.close();
    console.log('Seeding and database migration completed successfully!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});

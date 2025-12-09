const User = require('../models/User');

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        
        const leaderboard = await User.find()
            .select('username stats') 
            .sort({ 'stats.totalScore': -1 }) 
            .limit(10);

        res.json(leaderboard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.saveGameScore = async (req, res) => {
    const { userId, score } = req.body;

    try {
        let user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user.stats.totalScore += score;
        user.stats.gamesPlayed += 1;

        await user.save();
        res.json(user.stats);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
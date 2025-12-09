const fs = require('fs');
const path = require('path');

// Define the folder and file paths separately
const dirPath = path.join(__dirname, '../data');
const filePath = path.join(dirPath, 'activeRooms.json');

// 1. Check if the 'data' FOLDER exists, if not, create it
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
}

// 2. Check if the 'activeRooms.json' FILE exists, if not, create it
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
}

const getRooms = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file is corrupt or empty, return empty object
        return {};
    }
};

const saveRooms = (rooms) => {
    fs.writeFileSync(filePath, JSON.stringify(rooms, null, 2));
};

module.exports = { getRooms, saveRooms };
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const SOURCE_DIR = 'public/sfx/cut-down';
const TARGET_DIR = 'public/sfx';
const DURATION = 3; // seconds
const FADE_OUT = 0.5; // seconds

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

fs.readdir(SOURCE_DIR, (err, files) => {
    if (err) {
        console.error('Error reading source dir:', err);
        return;
    }

    files.forEach(file => {
        if (!file.endsWith('.mp3')) return;

        const inputPath = path.join(SOURCE_DIR, file);
        const outputPath = path.join(TARGET_DIR, file); // Move directly to sfx folder

        // ffmpeg command:
        // -i [input] 
        // -t [duration] (trim)
        // -af "afade=t=out:st=[duration-fade]:d=[fade]" (fade out)
        // -y (overwrite)
        
        const fadeStart = DURATION - FADE_OUT;
        const cmd = `ffmpeg -i "${inputPath}" -t ${DURATION} -af "afade=t=out:st=${fadeStart}:d=${FADE_OUT}" -y "${outputPath}"`;

        console.log(`Processing ${file}...`);
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error processing ${file}:`, error);
                return;
            }
            console.log(`Finished ${file}`);
        });
    });
});

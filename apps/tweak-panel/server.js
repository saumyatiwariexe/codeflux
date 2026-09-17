const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const targetFile = path.resolve(__dirname, '../mobile/components/map/MapCanvas.tsx');

app.post('/api/tweak', (req, res) => {
    try {
        const { zoom, pitch, scale, rotPitch, rotRoll, rotYaw, transX, transY, transZ } = req.body;
        
        let content = fs.readFileSync(targetFile, 'utf8');

        if (zoom !== undefined) {
            content = content.replace(/zoomLevel=\{[\d.]+\}/g, `zoomLevel={${zoom}}`);
        }
        if (pitch !== undefined) {
            content = content.replace(/pitch=\{[\d.]+\}/g, `pitch={${pitch}}`);
        }
        if (scale !== undefined) {
            content = content.replace(/modelScale:\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\]/g, `modelScale: [${scale}, ${scale}, ${scale}]`);
            content = content.replace(/key=\{`player-model-\$\{isWalking\}-[\w.-]+`\}/g, `key={\`player-model-\${isWalking}-${scale}\`}`);
        }
        if (rotPitch !== undefined && rotRoll !== undefined && rotYaw !== undefined) {
            content = content.replace(/modelRotation:\s*\[([\-\d.]+),\s*([\-\d.]+),\s*heading\s*\+\s*([\-\d.]+)\]/g, `modelRotation: [${rotPitch}, ${rotRoll}, heading + ${rotYaw}]`);
            content = content.replace(/key=\{`player-model-\$\{isWalking\}-[\w.-]+`\}/g, `key={\`player-model-\${isWalking}-${rotPitch}-${rotYaw}\`}`);
        }
        if (transX !== undefined && transY !== undefined && transZ !== undefined) {
            content = content.replace(/modelTranslation:\s*\[([\-\d.]+),\s*([\-\d.]+),\s*([\-\d.]+)\]/g, `modelTranslation: [${transX}, ${transY}, ${transZ}]`);
            content = content.replace(/key=\{`player-model-\$\{isWalking\}-[\w.-]+`\}/g, `key={\`player-model-\${isWalking}-${transX}-${transY}\`}`);
        }

        fs.writeFileSync(targetFile, content, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Tweak Panel Dashboard running on http://localhost:3000');
});

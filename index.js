const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

const port = 5000;

// Create the HTTP server.
const server = http.createServer((req, res) => {
    // Serve the index.html for the root route.
    if (req.url === '/') {
        serveFile(res, 'index.html', 'text/html');
    } else {
        serveFile(res, req.url);
    }
});

// Create the Socket.IO instance.
const io = socketIo(server);

// Serve static files with proper content type.
function serveFile(res, filePath, contentType = 'text/plain') {
    const fullPath = path.join(__dirname, filePath);
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.error(`Error loading ${filePath}:`, err);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File Not Found');
        } else {
            // Set the content type based on file extension
            if (filePath.endsWith('.css')) {
                contentType = 'text/css';
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}


// Listen for socket connections and define event handlers.
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle 'send message' event.
    socket.on('send message', (data) => {
        console.log(`Message from ${data.user}: ${data.text}`);
        io.emit('send message', data); // Emit the message data to all clients.
    });

    // Handle disconnection.
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server.
server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

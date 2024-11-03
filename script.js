// Initialize variables
let pinData = {
    x: [0],
    y: [0],
    mode: 'markers',
    marker: {
        size: 20,
        color: 'red',
        symbol: 'circle'
    },
    type: 'scatter',
    name: 'Your Rating'
};

// Create the layout
let layout = {
    title: 'Rate the Content',
    xaxis: {
        title: 'Liberal (Left) to Conservative (Right)',
        range: [-100, 100],
        zeroline: true
    },
    yaxis: {
        title: 'Objective (Top) to Subjective (Bottom)',
        range: [100, -100],
        zeroline: true
    },
    dragmode: 'pan', // Enable panning
    hovermode: 'closest' // Show hover info on closest point
};

// Render the graph
Plotly.newPlot('graph', [pinData], layout);

// Get the graph div
let graphDiv = document.getElementById('graph');

// Variables to track dragging state
let isDragging = false;

// Function to update the pin position
function updatePin(x, y) {
    pinData.x = [x];
    pinData.y = [y];
    Plotly.redraw('graph');
    // Display coordinates (optional)
    console.log(`Rating: Liberal-Conservative ${x.toFixed(2)}, Objective-Subjective ${y.toFixed(2)}`);
}

// Add event listener for mouse down
graphDiv.on('plotly_click', function(data){
    let x = data.points[0].x;
    let y = data.points[0].y;
    let pinX = pinData.x[0];
    let pinY = pinData.y[0];
    let dx = x - pinX;
    let dy = y - pinY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Set a threshold for detecting pin selection
    let threshold = 5; // Adjust as needed

    if (distance < threshold) {
        isDragging = true;
        graphDiv.style.cursor = 'grabbing';
    }
});

// Add event listener for mouse move
graphDiv.on('mousemove', function(event) {
    if (isDragging) {
        let xaxis = graphDiv._fullLayout.xaxis;
        let yaxis = graphDiv._fullLayout.yaxis;

        // Get mouse position relative to the plot area
        let mouseX = event.clientX - graphDiv.getBoundingClientRect().left - graphDiv._fullLayout.margin.l;
        let mouseY = event.clientY - graphDiv.getBoundingClientRect().top - graphDiv._fullLayout.margin.t;

        // Convert pixel coordinates to data coordinates
        let x = xaxis.p2d(mouseX);
        let y = yaxis.p2d(mouseY);

        // Update the pin position
        updatePin(x, y);
    }
});

// Add event listener for mouse up
graphDiv.on('mouseup', function(event) {
    if (isDragging) {
        isDragging = false;
        graphDiv.style.cursor = 'default';
    }
});

// Optional: Change cursor when hovering over the pin
graphDiv.on('plotly_hover', function(data){
    let x = data.points[0].x;
    let y = data.points[0].y;
    let pinX = pinData.x[0];
    let pinY = pinData.y[0];
    let dx = x - pinX;
    let dy = y - pinY;
    let distance = Math.sqrt(dx * dx + dy * dy);

    let hoverThreshold = 5;

    if (distance < hoverThreshold) {
        graphDiv.style.cursor = 'grab';
    } else {
        graphDiv.style.cursor = 'default';
    }
});

// Reset cursor when not hovering
graphDiv.on('plotly_unhover', function(data){
    graphDiv.style.cursor = 'default';
});
// Signup Function
function signup(username, password) {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
        alert('Username already exists.');
    } else {
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        alert('Signup successful!');
    }
}

// Login Function
function login(username, password) {
    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username] && users[username] === password) {
        sessionStorage.setItem('loggedInUser', username);
        alert('Login successful!');
        // Update UI accordingly
    } else {
        alert('Invalid username or password.');
    }
}

function saveRating(x, y) {
    let username = sessionStorage.getItem('loggedInUser');
    if (username) {
        let userRatings = JSON.parse(localStorage.getItem(username + '_ratings')) || [];
        userRatings.push({ x: x, y: y, date: new Date().toISOString() });
        localStorage.setItem(username + '_ratings', JSON.stringify(userRatings));
        alert('Rating saved!');
    } else {
        alert('Please log in to save your rating.');
    }
}

// Retrieve and display ratings
function displayUserRatings() {
    let username = sessionStorage.getItem('loggedInUser');
    if (username) {
        let userRatings = JSON.parse(localStorage.getItem(username + '_ratings')) || [];
        // Code to display ratings on the page
    }
}

function deleteRating(index) {
    let username = sessionStorage.getItem('loggedInUser');
    let userRatings = JSON.parse(localStorage.getItem(username + '_ratings'));
    userRatings.splice(index, 1);
    localStorage.setItem(username + '_ratings', JSON.stringify(userRatings));
    displayUserRatings();
}

function editRating(index, newX, newY) {
    let username = sessionStorage.getItem('loggedInUser');
    let userRatings = JSON.parse(localStorage.getItem(username + '_ratings'));
    userRatings[index].x = newX;
    userRatings[index].y = newY;
    localStorage.setItem(username + '_ratings', JSON.stringify(userRatings));
    displayUserRatings();
}

function generateHeatmapData() {
    let allRatings = [];
    // Collect ratings from localStorage
    for (let key in localStorage) {
        if (key.endsWith('_ratings')) {
            let ratings = JSON.parse(localStorage.getItem(key));
            allRatings = allRatings.concat(ratings);
        }
    }
    // Prepare data for heatmap
    let xValues = allRatings.map(r => r.x);
    let yValues = allRatings.map(r => r.y);
    return {
        x: xValues,
        y: yValues,
        type: 'histogram2d',
        colorscale: 'Hot',
        showscale: false
    };
}

// Add heatmap to the graph
function addHeatmapToGraph() {
    let heatmapData = generateHeatmapData();
    Plotly.addTraces('graph', heatmapData);
}

function shareOnTwitter() {
    let x = pinData.x[0].toFixed(2);
    let y = pinData.y[0].toFixed(2);
    let text = encodeURIComponent(`I rated content at Liberal-Conservative: ${x}, Objective-Subjective: ${y}`);
    let url = 'https://your-demo-url.com';
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}
function calculateAverageRating() {
    let username = sessionStorage.getItem('loggedInUser');
    let userRatings = JSON.parse(localStorage.getItem(username + '_ratings')) || [];
    if (userRatings.length > 0) {
        let avgX = userRatings.reduce((sum, r) => sum + r.x, 0) / userRatings.length;
        let avgY = userRatings.reduce((sum, r) => sum + r.y, 0) / userRatings.length;
        return { x: avgX, y: avgY };
    }
    return null;
}

function displayAverageRating() {
    let avg = calculateAverageRating();
    if (avg) {
        let avgData = {
            x: [avg.x],
            y: [avg.y],
            mode: 'markers',
            marker: {
                size: 15,
                color: 'blue',
                symbol: 'diamond'
            },
            type: 'scatter',
            name: 'Average Rating'
        };
        Plotly.addTraces('graph', avgData);
    }
}
// On page load
window.onload = function() {
    let username = sessionStorage.getItem('loggedInUser');
    if (username) {
        displayUserRatings();
        displayAverageRating();
    }
};
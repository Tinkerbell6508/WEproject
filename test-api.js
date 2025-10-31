const http = require('http');

const testRecipe = {
    title: 'Test Recipe',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: 'Test instructions'
};

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/recipes',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
    process.exit(1);
});

req.write(JSON.stringify(testRecipe));
req.end();
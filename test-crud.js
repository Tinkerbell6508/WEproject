const http = require('http');

// Helper function for HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => resolve(responseData));
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Sample recipes data
const sampleRecipes = [
    {
        title: "Classic Chocolate Chip Cookies",
        ingredients: [
            "2 1/4 cups all-purpose flour",
            "1 cup butter, softened",
            "3/4 cup sugar",
            "3/4 cup brown sugar",
            "2 large eggs",
            "1 tsp vanilla extract",
            "1 tsp baking soda",
            "1/2 tsp salt",
            "2 cups chocolate chips"
        ],
        instructions: "1. Preheat oven to 375°F (190°C)\n2. Cream butter and sugars\n3. Beat in eggs and vanilla\n4. Mix dry ingredients, then combine\n5. Stir in chocolate chips\n6. Drop rounded tablespoons onto baking sheets\n7. Bake 9-11 minutes until golden",
        imageURL: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e"
    },
    {
        title: "Garden Fresh Caprese Salad",
        ingredients: [
            "4 ripe tomatoes, sliced",
            "Fresh mozzarella, sliced",
            "Fresh basil leaves",
            "Extra virgin olive oil",
            "Balsamic vinegar",
            "Sea salt",
            "Fresh ground pepper"
        ],
        instructions: "1. Arrange alternating slices of tomato and mozzarella\n2. Tuck basil leaves between slices\n3. Drizzle with olive oil and balsamic\n4. Season with salt and pepper\n5. Serve immediately",
        imageURL: "https://images.unsplash.com/photo-1498579397066-22750a3cb424"
    },
    {
        title: "Homemade Margherita Pizza",
        ingredients: [
            "Pizza dough",
            "San Marzano tomatoes",
            "Fresh mozzarella",
            "Fresh basil",
            "Extra virgin olive oil",
            "Salt"
        ],
        instructions: "1. Preheat oven to 500°F with pizza stone\n2. Stretch dough into circle\n3. Top with crushed tomatoes\n4. Add torn mozzarella pieces\n5. Bake until crust is golden\n6. Top with fresh basil and olive oil",
        imageURL: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002"
    }
];

async function runTests() {
    const baseUrl = 'http://localhost:3000/api/recipes';
    
    try {
        console.log('Adding sample recipes...');
        for (const recipe of sampleRecipes) {
            const response = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/recipes',
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            }, recipe);
            console.log(`Added recipe: ${recipe.title}`);
        }

        // Get all recipes
        console.log('\nFetching all recipes...');
        const getAllResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/recipes',
            method: 'GET'
        });
        const recipes = JSON.parse(getAllResponse);
        console.log(`Found ${recipes.length} recipes`);

        // Update first recipe
        const firstRecipe = recipes[0];
        console.log(`\nUpdating recipe: ${firstRecipe.title}`);
        const updateResponse = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: `/api/recipes/${firstRecipe._id}`,
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        }, {
            ...firstRecipe,
            title: `${firstRecipe.title} (Updated)`,
            instructions: `${firstRecipe.instructions}\n8. Let cool slightly before serving`
        });
        console.log('Update successful');

        // Delete the test recipe we created earlier
        const testRecipe = recipes.find(r => r.title === 'Test Recipe');
        if (testRecipe) {
            console.log('\nDeleting test recipe...');
            await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: `/api/recipes/${testRecipe._id}`,
                method: 'DELETE'
            });
            console.log('Delete successful');
        }

        console.log('\nAll operations completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

runTests();
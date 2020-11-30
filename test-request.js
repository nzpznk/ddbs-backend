const fetch = require('node-fetch');

function test_user_read() {
    const userreaddat = {
        'userid': 35
    };
    fetch('http://localhost:3000/api/readlist', {method: 'POST', body: JSON.stringify(userreaddat), headers: {'Content-Type': 'application/json'}})
    .then(resp => resp.json())
    .then(dat => { console.log('success', dat.slice(0, 10)); console.log(dat.length) })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function test_user() {
    const userdat = [{ id: 'u25' }, { name: 'user25'}, {id: -5}, {name: 'kitty'}, {}, {hello: 'world'}];
    for (let x of userdat) {
        fetch('http://localhost:3000/api/user', {method: 'POST', body: JSON.stringify(x), headers: {'Content-Type': 'application/json'}})
        .then(resp => resp.json())
        .then(dat => { console.log('success', dat); })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
}

// test_user();
// test_article();
// test_user_read();
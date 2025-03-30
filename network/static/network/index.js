document.addEventListener("DOMContentLoaded", function() {

    document.querySelector('#post-form').addEventListener('submit', submit_post);
    load_posts();
});

function submit_post(event) {
    event.preventDefault();
    
    const content = document.querySelector('#post-content').value;
    
    fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            content: content
        }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
        }
    })
    .then(response => response.json())
    .then(result => {
        document.querySelector('#post-content').value = '';
        load_posts();
    });
}

function load_posts(){
    document.querySelector('#posts-view').innerHTML = '';
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            const post_div = document.createElement('div');
            post_div.innerHTML = `
                <p>${post.content}</p>
                <p><small>${post.timestamp}</small></p>
                <p><strong>${post.user}</strong></p>
                <p>Likes: ${post.likes}</p>
            `;
            document.querySelector('#posts-view').appendChild(post_div);
        });
    });
}
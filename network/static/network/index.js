document.addEventListener("DOMContentLoaded", function() {

    document.querySelector('#post-form').addEventListener('submit', submit_post);

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

        //load_posts();
    });
}

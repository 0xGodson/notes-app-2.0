if(document.getElementById("note-submit")){
    document.getElementById("note-submit").addEventListener("click", ()=> {
        window.noteTitle = document.getElementsByName("title")[0].value;
        window.noteBody = document.getElementsByName("body")[0].value;

        fetch('/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: noteTitle,
                note: noteBody
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
        console.log('Response received:', data);
        if (data.status === 'success') {
            window.location.href = '/notes';
        } else {
            alert(data.status); 
        }
        })

    })
}
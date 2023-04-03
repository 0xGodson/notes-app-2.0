let id;
let params = new URL(document.location).searchParams;

if (params.get("id")){
    id = params.get("id").trim().replace(/\s\r/,'');
    fetch(`/note/${id}`, {
        method: 'GET',
        headers: {
            'mode': 'read'
        },
    })
    .then(response => {
        return response.text()
    })
    .then(data => {
        if (data) {
            window.noteContent.innerHTML = DOMPurify.sanitize(data, {FORBID_TAGS: ['style']}); // no CSS Injection
        } else {
            document.getElementsByClassName("msg-info")[0].innerHTML="404 😭"
            window.noteContent.innerHTML = "404 😭" 
        }
    })
} else {
    document.getElementsByClassName("msg-info")[0].innerHTML="404 😭"
    window.noteContent.innerHTML = "404 😭"
}

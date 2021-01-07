window.onload = function() {
    $(".alert").fadeIn(200)
}

window.setTimeout(function() {
    $(".alert").fadeTo(500, 0, function(){
        $(this).remove(); 
    });
}, 3000)

const alertCreateAndDestroy = (type, text) => {
    let html = ""

    if (type === "success" | type === "error") { 
        if (type === "error") { type = "danger"}
        html = "<div class='alert alert-" + type + "' role='alert'>" + text + "</div>" 
    } else {
        return console.log("Type '" + type + "' not valid.")
    }
    $("body").append(html)
    $(".alert").fadeIn(200)

    window.setTimeout(function() {
        $(".alert").fadeTo(500, 0, function(){
            $(this).remove(); 
        });
    }, 3000)
}
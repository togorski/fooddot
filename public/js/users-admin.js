// New User

const buttonNewUser = document.querySelector("#new-user-btn")

buttonNewUser.addEventListener("click", () => {
    document.getElementById("new-username-input").value = ""
    document.getElementById("new-password-input").value = ""
    document.getElementById("new-displayName-input").value = ""
    document.getElementById("new-role-input").selectedIndex = 0
})

// Edit User

const editUserForm = document.querySelector("#edit-user-form")
const editUsernameInput = document.querySelector("#edit-username-input")
const editPasswordInput = document.querySelector("#edit-password-input")
const editDisplayNameInput = document.querySelector("#edit-displayName-input")
const editRoleInput = document.querySelector("#edit-role-input")

const buttonsEditUser =  document.querySelectorAll(".submit-edit-user-btn")

buttonsEditUser.forEach((button) => {
    button.addEventListener("click", function() {
        let userData = {}

        userData.id = this.dataset.id
        userData.username = this.dataset.username
        userData.displayName = this.dataset.displayname
        userData.role = this.dataset.role

        editUserForm.action = "/admin/users/" + userData.id + "?_method=PATCH"
        editUsernameInput.value = userData.username
        editDisplayNameInput.value = userData.displayName
        editRoleInput.value = userData.role
    })
})

// Delete User

const deleteUserForm = document.querySelector("#delete-user-form")
const deleteUserNameSpan = document.querySelector("#deleteUserNameSpan")

const buttonsDeleteUser =  document.querySelectorAll(".delete-user-btn")

buttonsDeleteUser.forEach((button) => {
    button.addEventListener("click", function() {
        let userData = {}

        userData.id = this.dataset.id
        userData.username = this.dataset.username
        deleteUserForm.action = "/admin/users/" + userData.id + "?_method=DELETE"
        deleteUserNameSpan.innerHTML = userData.username
    })
})

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
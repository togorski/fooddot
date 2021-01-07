// Initialisation
const newMenuItemButton = document.querySelector("#new-item-button")
const saveItemOrderButton = document.querySelector("#save-item-order-button")
const saveCategoryOrderButton = document.querySelector("#save-category-order-button")
const deleteCategoryButton = document.querySelector("#delete-category-button")
const editCategoryButton = document.querySelector("#edit-category-button")
const tabs = document.querySelectorAll(".nav-item")

// initialise tooltips on diet icons
$('img[data-toggle="tooltip"]').tooltip({
    animated: 'fade',
    placement: 'top',
    html: true
});

if (tabs[0]) {
    saveItemOrderButton.innerText = "Save " + tabs[0].innerText + " Order"
    saveItemOrderButton.dataset.categoryid = tabs[0].dataset.categoryid
    saveItemOrderButton.dataset.categoryname = tabs[0].innerText
    newMenuItemButton.dataset.categoryid = tabs[0].dataset.categoryid
    deleteCategoryButton.dataset.categoryid = tabs[0].dataset.categoryid
    deleteCategoryButton.dataset.categoryname = tabs[0].innerText
    editCategoryButton.dataset.categoryid = tabs[0].dataset.categoryid
    editCategoryButton.dataset.categoryname = tabs[0].innerText
    editCategoryButton.dataset.show = tabs[0].dataset.show
}

tabs.forEach((tab) => {
    tab.addEventListener("click", function() {
        saveItemOrderButton.innerText = "Save " + tab.innerText + " Order"
        saveItemOrderButton.dataset.categoryid = tab.dataset.categoryid
        saveItemOrderButton.dataset.categoryname = tab.innerText
        newMenuItemButton.dataset.categoryid = tab.dataset.categoryid
        deleteCategoryButton.dataset.categoryid = tab.dataset.categoryid
        deleteCategoryButton.dataset.categoryname = tab.innerText
        editCategoryButton.dataset.categoryid = tab.dataset.categoryid
        editCategoryButton.dataset.categoryname = tab.innerText
        editCategoryButton.dataset.show = tab.dataset.show
    })
})

const buttonsNewEditItem = document.querySelectorAll("button[data-target='#itemModal']")

buttonsNewEditItem.forEach((button) => {
    button.addEventListener("click", function() {
        const action = this.dataset.action

        let itemData = {}
        itemData.category = this.dataset.categoryid
        
        if (action === "edit") {
            itemData.id = this.dataset.itemid
            const itemDiv = document.querySelector(".menu-item[data-itemid='" + itemData.id +"']")
            itemData.name = $(itemDiv).find(".display-item-name")[0].innerText
            itemData.description = $(itemDiv).find(".display-item-description")[0].innerText
            itemData.price = $(itemDiv).attr("data-price")
            if ($(itemDiv).attr("data-available") == "true") { itemData.available = true } else { itemData.available = false }
            if ($(itemDiv).attr("data-vegan") == "true") { itemData.vegan = true } else { itemData.vegan = false }
            if ($(itemDiv).attr("data-vegetarian") == "true") { itemData.vegetarian = true } else { itemData.vegetarian = false }
            if ($(itemDiv).attr("data-glutenFree") == "true") { itemData.glutenFree = true } else { itemData.glutenFree = false }
        }

        $('#itemModal').on('show.bs.modal', function (event) {
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            var modal = $(this)
            if(action === "new") {
                modal.find('.modal-title').text('Create New Item')
                modal.find('#item-name-input').val("")
                modal.find('#description-input').val("")
                modal.find('#category-input').val(itemData.category)
                modal.find('#available-input').prop("checked", true)
                modal.find('#vegan-input').prop("checked", false)
                modal.find('#vegetarian-input').prop("checked", false)
                modal.find('#glutenFree-input').prop("checked", false)
                modal.find('form').attr({
                    action: "/admin/menu/items",
                    method: "POST"
                })
            } else {
                modal.find('.modal-title').text('Edit Item ' + itemData.name)
                modal.find('#item-name-input').val(itemData.name)
                modal.find('#description-input').val(itemData.description)
                modal.find('#category-input').val(itemData.category)
                modal.find('#price-input').val(itemData.price)
                modal.find('#available-input').prop("checked", itemData.available)
                modal.find('#vegan-input').prop("checked", itemData.vegan)
                modal.find('#vegetarian-input').prop("checked", itemData.vegetarian)
                modal.find('#glutenFree-input').prop("checked", itemData.glutenFree)
                modal.find('form').attr({
                    action: "/admin/menu/items/" + itemData.id + "?_method=PUT",
                    method: "POST"
                })
            }
        })
    })
})

// New/Edit Category Modal
const buttonsEditCategory = document.querySelectorAll("button[data-target='#categoryModal']")

buttonsEditCategory.forEach((button) => {
    button.addEventListener("click", function() {
        const action = this.dataset.action

        let categoryData = {}
        categoryData.name = this.dataset.categoryname
        categoryData.id = this.dataset.categoryid
        if (String(this.dataset.show) == "true") {
            categoryData.show = true
        } else {
            categoryData.show = false
        }
        
        $('#categoryModal').on('show.bs.modal', function (event) {
            // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
            var modal = $(this)
            if(action === "new") {
                modal.find('.modal-title').text('Create New Category')
                modal.find('#category-name-input').val("")
                modal.find('#category-show-input').prop("checked", "true")
                modal.find('form').attr({
                    action: "/admin/menu/categories",
                    method: "POST"
                })
            } else {
                modal.find('.modal-title').text('Edit Category ' + categoryData.name)
                modal.find('#category-name-input').val(categoryData.name)
                modal.find('#category-show-input').prop("checked", categoryData.show)
                modal.find('form').attr({
                    action: "/admin/menu/categories/" + categoryData.id + "?_method=PUT",
                    method: "POST"
                })
            }
          })
    })
})

// Delete Item/Category Modal
const buttonsDelete = document.querySelectorAll("button[data-action='delete']")

buttonsDelete.forEach((button) => {
    button.addEventListener("click", function() {
        const scope = this.dataset.scope
        let name = ""
        let id = ""
        let contentsText = " with all its contents"

        if (scope === "items") {
            name = this.dataset.itemname
            id = this.dataset.itemid       
        } else if (scope === "categories") {
            name = this.dataset.categoryname
            id = this.dataset.categoryid
        } else {
            return console.log(scope + " is not a valid scope")
        }

        $('#deleteModal').on('show.bs.modal', function (event) {
            var modal = $(this)
            modal.find('.modal-body').text('Do you really want to delete ' + name + contentsText + '?')
            modal.find('#description-input').val("")
            modal.find('form').attr({
                action: "/admin/menu/" + scope + "/" + id + "?_method=DELETE",
                method: "POST"
            })
        })
    })
})

// button - save item order change to database 
saveItemOrderButton.addEventListener("click", function() {
    // wywalic kategorie
    const categoryId = this.dataset.categoryid
    const categoryName = this.dataset.categoryname
    const divItems = document.querySelectorAll(".menu-category-grid[data-categoryid='" + categoryId + "'] div[class~='menu-item']")
    const itemsObj = []

    for(i=0; i < divItems.length; i++) {
        let singleItem = {}
        singleItem.id = divItems[i].dataset.itemid
        singleItem.index = i
        itemsObj.push(singleItem)
        //console.log(singleItem)
    }
    //console.log(itemsObj)
    
    fetch('/api/admin/changeMenuItemsOrder', {
    method: 'PATCH',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(itemsObj)
    }).then((response)=> {
        response.json().then((data) => {
            if(data.error) {
                alertCreateAndDestroy("error", "Failed to save: " + data.error)
            } else {
                alertCreateAndDestroy("success", "Item order for " + categoryName + " saved successfully")
            }
        })
    })
})

// button - save categories order change to database 
saveCategoryOrderButton.addEventListener("click", function() {
    const divCategories = document.querySelectorAll(".nav-item")
    const categoriesObj = []
    
    for(i=0; i < divCategories.length; i++) {
        let singleCategory = {}
        singleCategory.id = divCategories[i].dataset.categoryid
        singleCategory.index = i
        categoriesObj.push(singleCategory)
    }

    fetch('/api/admin/changeMenuCategoriesOrder', {
    method: 'PATCH',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(categoriesObj)
    }).then((response)=> {
        response.json().then((data) => {
            console.log(data)
            if(data.error) {
                alertCreateAndDestroy("error", "Failed to save: " + data.error)
            } else {
                alertCreateAndDestroy("success", "Categories order saved successfully")
            }
        })
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

$('.custom-file-input').on('change', function() {
    let fileName = $(this).val().split('\\').pop();
    $(this).siblings('.custom-file-label').addClass('selected').html(fileName);
});

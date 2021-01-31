const toggleCategoriesTriggers = document.querySelectorAll(".toggleCategories")
const categoriesTabs = document.querySelector(".categoriesTabs")
const toggleArrow = document.querySelector(".arrow")


toggleCategoriesTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
        toggleCategories()
        rotateArrow()
    })
})

function toggleCategories() {
    categoriesTabs.classList.toggle("categoriesTabs--hidden")
}

function rotateArrow() {
    toggleArrow.classList.toggle("arrow--rotated")
}

// Initialisation
const reloadTimeout = 10000
const newMenuItemButton = document.querySelector("#new-item-button")

const buttonsNewEditItem = document.querySelectorAll("button[data-target='#itemModal']")

const orderListArea = document.querySelector("#order-list-area")
const buttonsAddToOrder = document.querySelectorAll(".add-to-order")

// initialise tooltips on diet icons
$('img[data-toggle="tooltip"]').tooltip({
    animated: 'fade',
    placement: 'top',
    html: true
});

// Submit Order Listener

const submitOrderButton = document.querySelector("#submit-order-button")

submitOrderButton.addEventListener("click", () => setTimeout(submitOrder(), 8000) )//delete set timeout

buttonsAddToOrder.forEach((button) => {
    button.addEventListener("click", function() {
        // console.log(this.dataset.itemname)
        addItemToOrder(this.dataset.itemid, this.dataset.itemname, this.dataset.price)
    })
})

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

//

// button - save item order change to database 
// saveItemOrderButton.addEventListener("click", function() {
//     // wywalic kategorie
//     const categoryId = this.dataset.categoryid
//     const categoryName = this.dataset.categoryname
//     const divItems = document.querySelectorAll(".menu-category-grid[data-categoryid='" + categoryId + "'] div[class~='menu-item']")
//     const itemsObj = []

//     for(i=0; i < divItems.length; i++) {
//         let singleItem = {}
//         singleItem.id = divItems[i].dataset.itemid
//         singleItem.index = i
//         itemsObj.push(singleItem)
//         //console.log(singleItem)
//     }
//     //console.log(itemsObj)

    // fetch('/api/admin/changeMenuItemsOrder', {
    // method: 'PATCH',
    // headers: {
    //     'Accept': 'application/json, text/plain, */*',
    //     'Content-Type': 'application/json'
    // },
    // body: JSON.stringify(itemsObj)
    // }).then((response)=> {
    //     response.json().then((data) => {
    //         if(data.error) {
    //             alertCreateAndDestroy("error", "Failed to save: " + data.error)
    //         } else {
    //             alertCreateAndDestroy("success", "Item order for " + categoryName + " saved successfully")
    //         }
    //     })
    // })
// })

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
    }, 4000)
}

const createAmountSelectElement = () => {
    let optionElements = ""
    for (i = 1; i <= 99; i++) {
        optionElements += "<option value='" + i + "'>" + i + "</option>\n"
    }

    amountSelectElement = "<select class='item-order-amount custom-select mr-sm-2'>\n"
                        + optionElements
                        + "</select>"

    return amountSelectElement
}

const htmlAmountSelectElement = createAmountSelectElement()

const addItemToOrder = (id, name, price) => {

    const addAnotherItem = () => {
        let counter = getCurrentCount()
        counter += 1

        updateAmount(counter)
        updateMultipliedPrice(price, counter)
    }

    const updateMultipliedPrice = (price, counter) => {
        let priceSpan = foundItem.querySelector("span[class='item-order-price'")
        let priceSum = Number(price * counter).toFixed(2)
        priceSpan.textContent = priceSum
        foundItem.dataset.pricetotal = priceSum
    }

    const updateAmount = (counter) => {
        let counterSelect = foundItem.querySelector("select[class~='item-order-amount']");
        counterSelect.value = counter
        foundItem.dataset.amount = counter
    }

    const getCurrentCount = () => {
        let counterSelect = foundItem.querySelector("select[class~='item-order-amount']")
        let counter = parseInt(counterSelect.value)
        return counter
    }

    let foundItem = orderListArea.querySelector("[data-itemid='" + id + "']")
    let html = ""

    if (!foundItem) {

        html = 
            "<div class='item-order' data-itemid='" + id + "' data-name='" + name + "' data-pricetotal='" + price + "' data-amount='1'>" + 
            htmlAmountSelectElement +
            "<span class='item-order-name'>"   + name  + "</span>" +
            "<span class='item-order-price'>"  + Number(price).toFixed(2) + "</span>" +
            "<button class='icon-trash'></span>" +
            "</div>"
        
        
        $(orderListArea).append(html)

        foundItem = orderListArea.querySelector("[data-itemid='" + id + "']")
        
        orderListArea.querySelector("[data-itemid='" + id + "'] button").addEventListener("click", function(){
            this.parentElement.remove()
            updateTotalOrderPrice()
        })

        orderListArea.querySelector("[data-itemid='" + id + "'] select").addEventListener("change", function(){
            let counter = getCurrentCount()
            this.parentElement.dataset.amount = counter
            updateMultipliedPrice(price, counter)
            updateTotalOrderPrice()
        })

        updateTotalOrderPrice()

    } else {
        addAnotherItem()
        updateTotalOrderPrice()
    }
}

const calculateTotalOrder = () => {
    let items = orderListArea.querySelectorAll(".item-order")
    let sum = 0

    items.forEach((item) => {
        sum += Number(item.dataset.pricetotal)
    })

    return sum.toFixed(2)
}

const updateTotalOrderPrice = () => {
    const totalPriceSpan = document.querySelector("#total-price-sum")
    totalPriceSpan.innerText = calculateTotalOrder()
}

const markItemSoldOut = function(itemid) {
    // delete item from ordered list
    const orderedItemDiv = document.querySelector("#order-list-area > .item-order[data-itemid='" + itemid + "'")
    if (orderedItemDiv) orderedItemDiv.remove()

    // disable in menu
    const menuItemDiv = document.querySelector(".menu-item[data-itemid='" + itemid + "']")
    if (menuItemDiv) {
        menuItemDiv.querySelector(".price-tag .display-item-available").innerText = "Out of stock"
        let buttonAdd = menuItemDiv.querySelector(".card-footer .add-to-order")
        buttonAdd.disabled = true
        buttonAdd.classList.add("btn-outline-secondary")
        buttonAdd.classList.remove("btn-outline-primary")
    }
}

const submitOrder = function () {
    let order = []
    let amount, item, name

    const itemsDivs = document.querySelectorAll("#order-list-area > .item-order")

    for (i=0; i < itemsDivs.length; i++) {
        amount = itemsDivs[i].dataset.amount
        item = itemsDivs[i].dataset.itemid
        name = itemsDivs[i].dataset.name
        order.push({ amount, name, item })
    }
    // console.log(order)
    
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
        }).then((response)=> {
            response.json().then((data) => {
                if(data.error) {
                    
                    if (data.notAvailableItems) {
                        let notAvailableMessage = "Some of the items not available:<br><br>"
                        data.notAvailableItems.forEach(naItem => {
                            notAvailableMessage += naItem.name + "<br>"
                            markItemSoldOut(naItem.item)
                        })
                        calculateTotalOrder()
                        updateTotalOrderPrice()
                        alertCreateAndDestroy("error", notAvailableMessage)
                    } else {
                        alertCreateAndDestroy("error", "Failed to save: " + data.error)
                    }
                } else {
                    let newOrder = {}
                    newOrder.items = order
                    newOrder.orderNumber = data.orderNumber
                    console.log(newOrder)
                    socket.emit("orderCreated", newOrder, (msg) => {
                        // if (msg) {
                        //     return console.log(msg)
                        // }
                        console.log(msg)
                    })
                    $("#orderModal .order-number")[0].innerText = data.orderNumber
                    $("#orderModal").modal("show")
                    setTimeout(() => location.reload(true), reloadTimeout)

                    // alertCreateAndDestroy("success", "Order submitted successfully, your order number is: " + data.orderNumber)
                }
            })
        })
}

const buttonReload = document.querySelector("#reload-after-order")
buttonReload.addEventListener("click", () => location.reload(true))

const buttonStartOrdering = document.querySelector("#destroy-overlay")
buttonStartOrdering.addEventListener("click", function () {
    this.parentElement.remove()
})

// disable sold out items
let soldOutItems = document.querySelectorAll(".menu-item[data-available=false]")
soldOutItems.forEach(item => markItemSoldOut(item.dataset.itemid))
// $('#confirmModal').modal('toggle')

var socket = io();

var gridPreparing = new Muuri('#preparing',{
    dragEnabled: true,
    dragSortHeuristics: {
        sortInterval: 10,
        minDragDistance: 5,
        minBounceBackAngle: Math.PI / 2
      },
    dragStartPredicate: {
        delay: 100,
        distance: 10,
        handle: '.drag-handle'
    }
})

var gridReady = new Muuri('#ready',{
    dragEnabled: true,
    dragSortHeuristics: {
        sortInterval: 10,
        minDragDistance: 5,
        minBounceBackAngle: Math.PI / 2
      },
      dragStartPredicate: {
          delay: 100,
          distance: 10,
          handle: '.drag-handle'
      }
})

var gridPending = new Muuri('#pending',{
    dragEnabled: true,
    dragSortHeuristics: {
        sortInterval: 10,
        minDragDistance: 5,
        minBounceBackAngle: Math.PI / 2
      },
      dragStartPredicate: {
          delay: 100,
          distance: 10,
          handle: '.drag-handle'
      }
})

// on init - disable button ready and prepare on relevant tabs
document.querySelectorAll("#preparing .dropdown-menu .prepare").forEach(button => button.disabled = true)
document.querySelectorAll("#ready .dropdown-menu .ready").forEach(button => button.disabled = true)

$('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
    let newTabId = e.target.id // newly activated tab

    if(newTabId == "ready-tab") {
        gridReady.refreshItems().layout(true)
    } else if (newTabId =="preparing-tab") {
        gridPreparing.refreshItems().layout(true)
    } else if (newTabId =="pending-tab") {
        gridPending.refreshItems().layout(true)
    }
})

// make tab active on initiate
const activeTabHref = document.querySelector("a[class~='active']").href
document.getElementById(activeTabHref.substring(activeTabHref.indexOf("#") + 1,activeTabHref.length)).classList.add("show", "active")

gridReady.refreshItems().layout(true)
gridPreparing.refreshItems().layout(true)
gridPending.refreshItems().layout(true)

createEventListener = (button, status) => {
    if(button.dataset.action !== "confirm") {
        const currentGridId = button.closest(".tab-items-grid").id
        const currentStatus = currentGridId.substring(currentGridId.indexOf("#") + 1, currentGridId.length)
        
        //fix listeners - po zmiane statusu przycisk dalej zablokowany - moze dodac disabled
        // don't change status if status equals current status
        if (status.toLowerCase() === currentStatus) {
            // button.disabled = true;
        }
    } 
    
    var order = {}
    order.id = button.dataset.itemid
    order.status = status

    button.addEventListener("click", function(){
        fetch('/api/orders/changeStatusById', {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
            }).then((response)=> {
                response.json().then((data) => {
                    if(data.success) {
                        var orderDiv = document.querySelector(".order[data-itemid='" + order.id +"']")
                        var checkboxes = orderDiv.querySelectorAll(".order-line-checkbox")
                        var actionButtons = orderDiv.querySelectorAll(".dropdown-menu button")
                        var parentGrid = orderDiv.closest(".tab-items-grid")
                        
                        var muuriGrid = {}

                        if(parentGrid.id == "preparing"){
                            muuriGrid = gridPreparing
                        } else if (parentGrid.id == "ready"){
                            muuriGrid = gridReady
                        } else if (parentGrid.id == "pending"){
                            muuriGrid = gridPending
                        }

                        muuriGrid.remove(orderDiv, {removeElements: true})

                        actionButtons.forEach(button => button.disabled = false)

                        if(status == "Ready") {
                            orderDiv.querySelector(".ready").disabled = true
                            checkboxes.forEach(checkbox => checkbox.hidden = true)
                            gridReady.add(orderDiv, {layout: true})
                        } else if (status == "Preparing") {
                            orderDiv.querySelector(".prepare").disabled = true
                            checkboxes.forEach(checkbox => checkbox.hidden = false)
                            gridPreparing.add(orderDiv, {layout: true})
                        }
                        
                        socket.emit("statusUpdate", order, (msg) => {
                            console.log(msg)
                        })

                    } else {
                        alertCreateAndDestroy("error", "Failed to change status: " + data.error)
                    }
                })
            })
    })
}

const readyButtons = document.querySelectorAll("button[class~='ready']")

readyButtons.forEach(function(button){
    createEventListener(button, "Ready")
})

const prepareButtons = document.querySelectorAll("button[class~='prepare']")

prepareButtons.forEach(function(button){
    createEventListener(button, "Preparing")
})

const deliveredButtons = document.querySelectorAll("button[class~='delivered']")

deliveredButtons.forEach(function(button){
    button.addEventListener("click", () => { 
        $('#confirmModal').modal('show')
        const confirmButton = document.getElementById("confirm-modal-button")
        confirmButton.dataset.itemid = button.dataset.itemid
        createEventListener(confirmButton, "Delivered")
    })
})

const cancelButtons = document.querySelectorAll("button[class~='cancel']")

cancelButtons.forEach(function(button){
    button.addEventListener("click", () => {
        $('#confirmModal').modal('show')
        const confirmButton = document.getElementById("confirm-modal-button")
        confirmButton.dataset.itemid = button.dataset.itemid
        createEventListener(confirmButton, "Cancelled")
    })
})

$('#confirmModal').on('hide.bs.modal', function (event) {
    const modalConfirmButtonOld = document.getElementById("confirm-modal-button")
    const modalConfirmButtonCopy =  modalConfirmButtonOld.cloneNode(true);
    modalConfirmButtonOld.parentNode.replaceChild(modalConfirmButtonCopy, modalConfirmButtonOld);
})

$('.btn-group').on('show.bs.dropdown', function () {
    this.closest(".order").style.zIndex = "9999"
  })

$('.btn-group').on('hide.bs.dropdown', function () {
    this.closest(".order").style.zIndex = "1"
})

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
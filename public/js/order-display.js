const socket = io()

const opacityAnimationTime = 1000
// const container = document.querySelector(".container")

const createOrderDiv = (orderNumber, orderID, status) => {
    const statusMarkDiv = document.querySelector(`.mark[data-status='${status}']`)
   const html = 
   `<div class='order' data-status='${status}' data-itemid='${orderID}'>
        <div class='order-number'>${orderNumber}</div>
        <div class='order-status'>${status}</div>
    </div>`

    statusMarkDiv.insertAdjacentHTML("beforebegin", html)
}

const moveToStatusSection = (element, status) => {
    const statusMarkDiv = document.querySelector(`.mark[data-status='${status}']`)
    element.remove()

    if(status == "Cancelled" || status == "Delivered") {
        return
    }

    let newElement = statusMarkDiv.insertAdjacentElement("beforebegin", element)
    newElement.classList.toggle(status.toLowerCase())
    // timeout just for animation purposes so element won't appear instantly
    window.setTimeout(function() {
        newElement.style.opacity = 1
    }, 50)
}

// sort items
const orders = document.querySelectorAll(".order:not([hidden])")

orders.forEach((order) => {
    moveToStatusSection(order, order.dataset.status)
})

socket.on("newOrder", (order) => {
    console.log(order)
    createOrderDiv(order.orderNumber, order.id, "Pending")
})

socket.on("orderStatusUpdate", (order) => {
    let orderDiv = document.querySelector(`div[data-itemid='${order.id}`)
    let currentStatus = orderDiv.dataset.status

    orderDiv.style.opacity = 0

    window.setTimeout(function() {
        orderDiv.dataset.status = order.status
        orderDiv.querySelector(".order-status").innerText = order.status
        orderDiv.classList.toggle(currentStatus.toLowerCase())
        moveToStatusSection(orderDiv, order.status)
    }, opacityAnimationTime)

})
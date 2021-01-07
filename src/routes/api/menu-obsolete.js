app.get("/api/menu/availableCheck/:id", async (req, res) => {
    let available
    try {
        available = await MenuItem.checkAvailableById(req.params.id)
    } catch (error) {
        res.send({success: false, error: error.message})
    }
    
    res.send({success: true, available})
})

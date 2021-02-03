Fooddot

Node/Mongo/Express/Handlebars/Socket.io

Demo - https://fooddot.herokuapp.com/ login: tester password: tester

Panels:
Admin - Menu: Allows to manage menu items and categories, make them visible/hidden, change display order by dragging and dropping.

Admin - Users: Manage users and assign user roles.

Client: Menu where client can order menu items and receives order number.

Display: Live display of current orders.

Kitchen: Panel for the kitchen stuff where order details are displayed and its status can be changed.

Some of the lessons learned:
- CSS - stick to BEM from the beginning
- definitely create design project first
- when someone is starting DO NOT recommend projects like that, start smaller
- split files (mainly js, css and views) when possible and it makes sense, from the beginning

To do:
- implement input sanitization
- add more protection on inputs
- implement autologout on front (if needed)
- responsive design (more effort spent only on client/order menu)
- use css grid for client menu items
- css files cleanup/split
- add default image for menu when there is no image
- host menu images in cloud or use different databases for local and heroku
- hide and protected logout for display and client.

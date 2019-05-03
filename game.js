function game() {
    var model = new Model();

    var views = {
        button: new ButtonView(),
        title: new TitleView(),
        description: new DescriptionView()
    }

    var presenter = new Presenter(model, views);

    presenter.initializeGame();
}


var Model = function() {
    return {
        state: {
            title: "Title",
            description: "Description",
            buttons: {
                A: "A",
                B: "B",
                C: "C",
                D: "D"
            }
        },

    }
}

var Presenter = function(model, views) {
    return {
        _model: model,
        _views: views,

        initializeGame: function() {
            this.setTitle("Anger!")
            this.setDescription("You are testing a game.");
            this.setButtons({
                "A": "Bork",
                "B": "Bork",
                "C": "Bork",
                "D": "Bork"
            });

            this._views["button"].addButtonClickCallback(this.buttonClickListener);
        },

        setScene: function(title, description, buttons) {
            this.setTitle(title);
            this.setDescription(description);
            this.setButtons(buttons);
        },

        // TODO this stuff is just generally wrong.
        // The model should be supplying the data to set the title with, etc.

        setTitle: function(title) {
            this._model.title = title;
            this._views['title'].setTitle(title);
        },

        setDescription: function(description) {
            this._model.description = description;
            this._views['description'].setDescription(description);
        },

        setButtons: function(buttons) {
            this._model.buttons = buttons;
            this._views['button'].setButtonLabels(buttons);
        },

        buttonClickListener: function(buttonCode) {
            console.log(buttonCode);
        }
    }
}

// Views: Directly update the interface.

var TitleView = function() {
    return {
        _TITLE_ID: "text-title",

        setTitle: function(title) {
            document.getElementById(this._TITLE_ID).innerHTML = title;
        }
    }
}

var DescriptionView = function() {
    return {
        _DESCRIPTION_ID: "text-description",

        setDescription: function(description) {
            document.getElementById(this._DESCRIPTION_ID).innerHTML = description;
        }
    }
}

var ButtonView = function() {
    return {
        _BUTTON_A_ID: 'button-A',
        _BUTTON_B_ID: 'button-B',
        _BUTTON_C_ID: 'button-C',
        _BUTTON_D_ID: 'button-D',


        addButtonClickCallback: function(callback) {
            this._buttonClickCallback = callback;
            boundInterceptor = this._interceptButtonClickEvent.bind(this); // Otherwise the listeners get bound to their elements and lose context


            document.getElementById(this._BUTTON_A_ID).addEventListener('click', boundInterceptor);
            document.getElementById(this._BUTTON_B_ID).addEventListener('click', boundInterceptor);
            document.getElementById(this._BUTTON_C_ID).addEventListener('click', boundInterceptor);
            document.getElementById(this._BUTTON_D_ID).addEventListener('click', boundInterceptor);
        },

        _interceptButtonClickEvent: function(event) {
            var buttonElementId = event.target.id;
            var buttonCode = "";

            if (buttonElementId === this._BUTTON_A_ID) {
                buttonCode = "A";
            } else if (buttonElementId === this._BUTTON_B_ID) {
                buttonCode = "B";
            } else if (buttonElementId === this._BUTTON_C_ID) {
                buttonCode = "C";
            } else if (buttonElementId === this._BUTTON_D_ID) {
                buttonCode = "D";
            }

            this._buttonClickCallback(buttonCode);
        },

        setButtonLabels: function(buttonLabels) {
            document.getElementById(this._BUTTON_A_ID).innerHTML = buttonLabels.A;
            document.getElementById(this._BUTTON_B_ID).innerHTML = buttonLabels.B;
            document.getElementById(this._BUTTON_C_ID).innerHTML = buttonLabels.C;
            document.getElementById(this._BUTTON_D_ID).innerHTML = buttonLabels.D;
        }
    }
}
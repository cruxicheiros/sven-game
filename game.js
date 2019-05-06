function game() {
    var model = new Model(gameScript);

    var views = {
        button: new ButtonView(),
        title: new TitleView(),
        description: new DescriptionView()
    }

    var presenter = new Presenter(model, views);

    presenter.initializeGame();
}


var Model = function(script) {
    return {
        _script: script,
        _state: {
            stage: 0,
            round: 0,
            scene: 0,

            lastChoice: null,

            title: null,
            description: null,
            choices: {
                A: null,
                B: null,
                C: null,
                D: null
            }
        },

        getLastChoice: function() {
            return this._state.lastChoice;
        },

        getTitle: function() {
            return this._state.title;
        },

        getDescription: function() {
            return this._state.description;
        },

        getChoices: function() {
            return this._state.choices;
        },

        _incrementScene() {
            var maxStageIndex = this._script.stages.length - 1;
            var maxStageRoundIndex = this._script.stages[this._state.stage].rounds.length - 1;
            var maxRoundSceneIndex = this._script.stages[this._state.stage].rounds[this._state.round].scenes.length - 1;

            if (this._state.scene < maxRoundSceneIndex) {
                this._state.scene++;
            } else if (this._state.round < maxStageRoundIndex) {
                this._state.scene = 0;
                this._state.round++;
            } else if (this._state.stage < maxStageIndex) {
                this._state.scene = 0;
                this._state.round = 0;
                this._state.stage++;
            } else {
                console.log("Hit end of script. Game end.");
            }
        },

        _getSceneData() {
            return this._script.stages[this._state.stage].rounds[this._state.round].scenes[this._state.scene];
        },


        _renderTitle() {
            this._state.title = this._getSceneData()["title"];
        },

        _renderDescription() {
            var description = this._getSceneData()["description"];

            if (description.type == "static") {
                this._state.description = description.text.replace("[LAST_CHOICE]", this.getLastChoice());
                return;
            }

            if (description.type == "random") {
                var renderedDescription = "";
                var descriptionSegments = description.text;

                for (var i = 0; i < description.text.length; i++) {
                    var segmentIndex = Math.floor(Math.random() * description.text[i].length);
                    var segment = descriptionSegments[i][segmentIndex];

                    renderedDescription = renderedDescription + " " + segment;
                }

                this._state.description = renderedDescription.replace("[LAST_CHOICE]", this.getLastChoice());
                return;
            }

            throw new Error("Invalid description type " + description.type + " at text '" + description.text + "'");
        },

        _renderChoices() {
            var choices = this._getSceneData()["choices"];

            if (choices.type == "static") {
                this._state.choices["A"] = choices.selection["A"];
                this._state.choices["B"] = choices.selection["B"];
                this._state.choices["C"] = choices.selection["C"];
                this._state.choices["D"] = choices.selection["D"];

                return;
            }

            if (choices.type == "random") {
                var buttonCodes = ["A", "B", "C", "D"];
                var randomizedChoices = {};
                var selectedIndexes = [];

                for (i = 0; i < buttonCodes.length; i++) {
                    var index = Math.floor(Math.random() * choices.selection.length);

                    while (selectedIndexes.includes(index)) {
                        index = Math.floor(Math.random() * choices.selection.length);
                    }

                    randomizedChoices[buttonCodes[i]] = choices.selection[index];
                    selectedIndexes.push(index);
                }

                this._state.choices = randomizedChoices;
                return;
            }

            throw new Error("Invalid choice type " + choices.type);
        },

        _setLastChoice(choice) {
            var choiceText = this._state.choices[choice];
            this._state.lastChoice = choiceText;
        },

        render: function() {
            this._renderTitle();
            this._renderDescription();
            this._renderChoices();
        },

        next: function(choice) {
            if (choice) {
                this._setLastChoice(choice)
            }

            this._incrementScene();
            this.render();
        }
    }
}

var Presenter = function(model, views) {
    return {
        _model: model,
        _views: views,

        initializeGame: function() {
            this.buttonClickListener = this.buttonClickListener.bind(this);
            this._views["button"].addButtonClickCallback(this.buttonClickListener);
            this._model.render();
            this.updateScene();
        },

        updateScene: function() {
            this.setTitle(this._model.getTitle());
            this.setDescription(this._model.getDescription());
            this.setButtons(this._model.getChoices());
        },

        setTitle: function(title) {
            this._views['title'].setTitle(title);
        },

        setDescription: function(description) {
            this._views['description'].setDescription(description);
        },

        setButtons: function(choices) {
            this._views['button'].setButtonLabels(choices);
        },

        buttonClickListener: function(buttonCode) {
            console.log(buttonCode);
            console.log(this);
            this._model.next(buttonCode);
            this.updateScene();
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

        _BUTTON_DISABLED_TEXT: "-",

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
            if (buttonLabels.A) {
                document.getElementById(this._BUTTON_A_ID).innerHTML = buttonLabels.A;
                document.getElementById(this._BUTTON_A_ID).disabled = false;
            } else {
                document.getElementById(this._BUTTON_A_ID).innerHTML = this._BUTTON_DISABLED_TEXT;
                document.getElementById(this._BUTTON_A_ID).disabled = true;
            }

            if (buttonLabels.B) {
                document.getElementById(this._BUTTON_B_ID).innerHTML = buttonLabels.B;
                document.getElementById(this._BUTTON_B_ID).disabled = false;
            } else {
                document.getElementById(this._BUTTON_B_ID).innerHTML = this._BUTTON_DISABLED_TEXT;
                document.getElementById(this._BUTTON_B_ID).disabled = true;
            }

            if (buttonLabels.C) {
                document.getElementById(this._BUTTON_C_ID).innerHTML = buttonLabels.C;
                document.getElementById(this._BUTTON_C_ID).disabled = false;
            } else {
                document.getElementById(this._BUTTON_C_ID).innerHTML = this._BUTTON_DISABLED_TEXT;
                document.getElementById(this._BUTTON_C_ID).disabled = true;
            }

            if (buttonLabels.D) {
                document.getElementById(this._BUTTON_D_ID).innerHTML = buttonLabels.D;
                document.getElementById(this._BUTTON_D_ID).disabled = false;
            } else {
                document.getElementById(this._BUTTON_D_ID).innerHTML = this._BUTTON_DISABLED_TEXT;
                document.getElementById(this._BUTTON_D_ID).disabled = true;
            }
        }
    }
}

/* Script JSON */

var gameScript = {
    "stages": [{
        "name": "Doctor Sven",
        "rounds": [{
                "name": "Intro",
                "scenes": [{
                        "title": "Doctor:",
                        "description": {
                            "type": "static",
                            "text": "\"Dr. Sven! We have so many patients!\"",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Doctor:",
                        "description": {
                            "type": "static",
                            "text": "\"Here, take these ones!\"",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork...",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Alert!",
                        "description": {
                            "type": "static",
                            "text": "The first patient is coming.",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Start",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    }
                ]
            },
            {
                "name": "Prescribe",
                "scenes": [{
                        "title": "Prescribe!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["", "Doctor!", "Dr. Sven!", "My dude.", "Help me!", "AAAAARGH!", "Man!"],
                                ["My nose", "My leg", "My entire body", "My face", "My dog", "My chin", "My teeth"],
                                ["won't", "can't", "should"],
                                ["fall off", "stop hurting", "grow hair", "sweat", "exist"],
                                ["..."]
                            ]
                        },
                        "choices": {
                            "type": "random",
                            "selection": [
                                "Sven", "Burger", "Pat", "Walk", "Dogs", "Borking"
                            ]
                        }
                    },
                    {
                        "title": "Disappoint!",
                        "description": {
                            "type": "static",
                            "text": "The pharmacist wouldn't dispense a [LAST_CHOICE]..."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "SAD",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    }
                ]
            }
        ]
    }]
};

/*
Polyfills
*/

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function(valueToFind, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            // 1. Let O be ? ToObject(this value).
            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(valueToFind, elementK) is true, return true.
                if (sameValueZero(o[k], valueToFind)) {
                    return true;
                }
                // c. Increase k by 1. 
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
function game() {
    var model = new Model(gameScript);

    var views = {
        button: new ButtonView(),
        title: new TitleView(),
        description: new DescriptionView(),
        image: new ImageView()
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

            lastChoice: "",

            title: null,
            description: null,
            image: "titleCard",
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

        getImage: function() {
            return this._state.image;
        },

        getChoices: function() {
            return this._state.choices;
        },

        _incrementScene: function() {
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
                this._state.scene = 0;
                this._state.round = 0;
                this._state.stage = 0;
            }
        },

        _getSceneData: function() {
            return this._script.stages[this._state.stage].rounds[this._state.round].scenes[this._state.scene];
        },

        _renderTitle: function() {
            this._state.title = this._getSceneData()["title"];
        },

        _renderDescription: function() {
            var description = this._getSceneData()["description"];
            var lastChoice = "*" + this.getLastChoice() + "*"

            if (description.type == "static") {
                this._state.description = description.text.replace("[LAST_CHOICE]", lastChoice);
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

                this._state.description = renderedDescription.replace("[LAST_CHOICE]", lastChoice);
                return;
            }

            throw new Error("Invalid description type " + description.type + " at text '" + description.text + "'");
        },

        _renderImage: function() {
            var sceneData = this._getSceneData();
            
            if ("image" in sceneData) {
                this._state.image = sceneData["image"];
            }
        },

        _renderChoices: function() {
            var choices = this._getSceneData()["choices"];

            if (choices.type == "static") {
                this._state.choices["A"] = choices.selection["A"];
                this._state.choices["B"] = choices.selection["B"];
                this._state.choices["C"] = choices.selection["C"];
                this._state.choices["D"] = choices.selection["D"];

                return;
            }

            if (choices.type == "random") {
                var choiceCodes = ["A", "B", "C", "D"];
                var randomizedChoices = {};
                var selectedIndexes = [];

                for (i = 0; i < choiceCodes.length; i++) {
                    var index = Math.floor(Math.random() * choices.selection.length);

                    while (selectedIndexes.includes(index)) {
                        index = Math.floor(Math.random() * choices.selection.length);
                    }

                    randomizedChoices[choiceCodes[i]] = choices.selection[index];
                    selectedIndexes.push(index);
                }

                this._state.choices = randomizedChoices;
                return;
            }

            throw new Error("Invalid choice type " + choices.type);
        },

        _setLastChoice: function(choice) {
            var choiceText = this._state.choices[choice];
            this._state.lastChoice = choiceText;
        },

        render: function() {
            this._renderTitle();
            this._renderDescription();
            this._renderImage();
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
            this.setImage(this._model.getImage());
            this.setButtons(this._model.getChoices());
        },

        setTitle: function(title) {
            this._views['title'].setTitle(title);
        },

        setDescription: function(description) {
            this._views['description'].setDescription(description);
        },

        setImage: function(image){
            this._views['image'].setImage(image);
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

        _capsRegex: /(\*)(.*?)\1/g,

        _capsReplacer: function(fullMatch, tagStart, tagContents){
            return '<span class="caps">'+ tagContents + '</span>';
        },

        setDescription: function(description) {
            description = description.replace(this._capsRegex, this._capsReplacer)
            document.getElementById(this._DESCRIPTION_ID).innerHTML = description;
        }
    }
}

var ImageView = function() {
    return {
        _IMAGE_ID: "game-image",
        _imagePaths: images,

        setImage: function(image) {
            document.getElementById(this._IMAGE_ID).src = this._imagePaths[image];
        }
    }
}

var Button = function(code, htmlId) {
    return {
        code: code,
        htmlId: htmlId,
        htmlElement: document.getElementById(htmlId)
    }
}

var ButtonView = function() {
    return {
        _BUTTON_DISABLED_TEXT: "-",
        
        _buttons: [
            new Button('A', 'button-A'),
            new Button('B', 'button-B'),
            new Button('C', 'button-C'),
            new Button('D', 'button-D'),
        ],

        addButtonClickCallback: function(callback) {
            this._buttonClickCallback = callback;
            var boundInterceptor = this._interceptButtonClickEvent.bind(this); // Otherwise the listeners get bound to their elements and lose context

            for (i = 0; i < this._buttons.length; i++) {
                this._buttons[i].htmlElement.addEventListener('click', boundInterceptor);
            }
        },

        _interceptButtonClickEvent: function(event) {
            var buttonElementId = event.target.id;

            for (i = 0; i < this._buttons.length; i++) {
                if (buttonElementId === this._buttons[i].htmlId) {
                    this._buttonClickCallback(this._buttons[i].code);
                    return;
                }
            }
        },

        setButtonLabels: function(buttonLabels) {
            for (i = 0; i < this._buttons.length; i++) {
                var button = this._buttons[i];
                
                if (buttonLabels[button.code]) {
                    button.htmlElement.innerHTML = buttonLabels[button.code];
                    button.htmlElement.disabled = false;
                } else {
                    button.htmlElement.innerHTML = this._BUTTON_DISABLED_TEXT;
                    button.htmlElement.disabled = true;
                }
            }
        }
    }
}

/* Game image paths */

var images = {
    "titleCard": "img/titlecard.png",
    "drSven": "img/drsven.png",
    "house": "img/house.png",
    "lawSven": "img/lawsven.png",
    "ejected": "img/nosven.png",
    "bus": "img/svenbus.png",
    "theEnd": "img/theend.png",
    "chefSven": "img/chefsven.png"
}

/* Script JSON */

var gameScript = {
    "stages": [
        {
            "name": "Menu",
            "rounds": [
                {
                    "name": "Menu",
                    "scenes": [{
                        "title": "Start!",
                        "description": {
                            "type": "static",
                            "text": "Welcome to *Adsventure Game!*"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Start",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        },
                        "image": "titleCard"
                    }]
                }
            ]
        },
        {
            "name": "Cutscene 1",
            "rounds": [
                {
                    "name": "Home",
                    "scenes": [{
                        "title": "Sleepy...",
                        "description": {
                            "type": "static",
                            "text": "You just woke up. But nobody is in the house!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Check",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        },
                        "image": "house"
                    },
                    {
                        "title": "Confused!",
                        "description": {
                            "type": "static",
                            "text": "And the door is open!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Leave",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Slam!",
                        "description": {
                            "type": "static",
                            "text": "The door shuts behind you! But you see a bus..."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bus",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    }]
                },
                {
                    "name": "Bus",
                    "scenes": [{
                        "title": "Moving!",
                        "description": {
                            "type": "static",
                            "text": "You get on the bus! The next stop is the *hospital*."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Ride",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        },
                        "image": "bus"
                    },
                    {
                        "title": "Ejection!",
                        "description": {
                            "type": "static",
                            "text": "The driver doesn't accept dog dollars!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        },
                        "image": "ejected"
                    }
                ]}
            ]
        },
        {
            "name": "Hospital",
            "rounds": [{
                "name": "Intro",
                "scenes": [{
                        "title": "Doctor:",
                        "description": {
                            "type": "static",
                            "text": "Dr. Sven! We have so many patients!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        },
                        "image": "drSven"
                    },
                    {
                        "title": "Doctor:",
                        "description": {
                            "type": "static",
                            "text": "Here, take these ones!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork...",
                                "B": "Wag...",
                                "C": "Push...",
                                "D": "Smell..."
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
                                ["Doctor! My"],
                                ["", "aunt's", "friend's", "uncle's"], 
                                ["entire body", "giant wound", "toenail", "armpit", "elbow"],
                                ["is going to"],
                                ["fall off!"]
                            ]
                        },
                        "choices": {
                            "type": "random",
                            "selection": [
                                "Burgers", "Cheese", "Egg", "Bread", "Carrot", "Kibble", "Peas", "Peanuts"
                            ]
                        }
                    },
                    {
                        "title": "Disappoint!",
                        "description": {
                            "type": "static",
                            "text": "The pharmacist wouldn't dispense [LAST_CHOICE]..."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Prescribe!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["Help! Help! My"],
                                ["teeth", "hairs", "legs", "arms", "spine bones"],
                                ["grow hair!", "sweat!", "rotate!", "went green!"]
                            ]
                        },
                        "choices": {
                            "type": "random",
                            "selection": [
                                "Pat", "Walk", "Bork", "Run", "Nap", "Wag"
                            ]
                        }
                    },
                    {
                        "title": "Doctor:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["Umm... It looks like you prescribed"],
                                ["20mg", "500mg", "23mg", "12mg", "3000mg"],
                                ["of [LAST_CHOICE]..."]
                            ]
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Doctor:",
                        "description": {
                            "type": "static",
                            "text": "The pharmacist is complaining about your handwriting!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Doctor:",
                        "description": {
                            "type": "static",
                            "text": "Okay... but you can't do that! Don't do it again!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Prescribe!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["Noooo!! Look at my"],
                                ["toes!", "fingers!", "eyeballs!", "lungs!", "shoulders!"],
                                ["You have to do something!"]
                            ]
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork!!",
                                "B": "Wag!!",
                                "C": "Push!!",
                                "D": "Smell!!"
                            }
                        }
                    },
                    {
                        "title": "Pharmacist:",
                        "description": {
                            "type": "static",
                            "text": "[LAST_CHOICE]?! This is ridiculous!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Pharmacist:",
                        "description": {
                            "type": "static",
                            "text": "I've come to find out what's going on for myself!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork...",
                                "B": "Wag!",
                                "C": "Push.",
                                "D": "Smell?"
                            }
                        }
                    },
                    {
                        "title": "Defend!",
                        "description": {
                            "type": "static",
                            "text": "The pharmacist has accused you of being a dog!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork!",
                                "B": "Wag!",
                                "C": "Push!",
                                "D": "Smell!"
                            }
                        }
                    },
                    {
                        "title": "Success!",
                        "description": {
                            "type": "static",
                            "text": "[LAST_CHOICE] A successful defense!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
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
                            "text": "Wait! Dr. Sven! We need you in surgery!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    }
                ]
            },
            {
                "name": "Surgery Intro",
                "scenes": [{
                        "title": "Surgery!",
                        "description": {
                            "type": "static",
                            "text": "You [LAST_CHOICE] into the operating theatre!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Surgeon:",
                        "description": {
                            "type": "static",
                            "text": "Dr. Sven! Can you assist me?",
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
                    },
                ]
            },
            {
                "name": "Surgery Game",
                "scenes": [
                    {
                        "title": "Surgeon:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["Can you help me remove the"],
                                ["lizard", "anvil", "kettle", "fork", "chair"],
                                ["from the"],
                                ["brain?", "knee?", "elbow?", "nose?", "stomach?"]
                            ],
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Action!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["You [LAST_CHOICE]"],
                                ["convincingly!", "reassuringly!", "smellily...", "weirdly.", "oddly!"]
                            ],
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Safe!",
                        "description": {
                            "type": "static",
                            "text": "The surgeon is still satisfied that you are not a dog.",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Surgeon:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["First, pass me the"],
                                ["sharp thing!", "spanner!", "hammer!", "bone saw!", "bread knife!"]
                            ],
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Action!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["You [LAST_CHOICE]"],
                                ["at the surgeon!", "at the patient.", "in time with the beeping things!"]
                            ],
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Danger!",
                        "description": {
                            "type": "static",
                            "text": "The surgeon is beginning to have suspicions!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Surgeon:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["We need to replace their"],
                                ["bones", "fingers", "toes", "skin", "blood"],
                                ["with"],
                                ["bones!", "fingers!", "toes!", "skin!", "blood!"]
                            ]
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Action!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["You [LAST_CHOICE]"],
                                ["to yourself.", "at nothing.", "to help you think."]
                            ],
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Suspicion!",
                        "description": {
                            "type": "static",
                            "text": "The surgeon...",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Safe!",
                        "description": {
                            "type": "static",
                            "text": "The surgeon second-guesses themself.",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Surgeon:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["\Quick! Use the"],
                                ["blood!", "oxygen!", "fire!", "electricity!"]
                            ]
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Action!",
                        "description": {
                            "type": "random",
                            "text": [
                                ["You [LAST_CHOICE]"],
                                ["and it solves the problem!", "and it does absolutely nothing!", "and the patient stands up on the table!"]
                            ],
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                ]
            },
            {
                "name": "Surgery Outro",
                "scenes": [{
                        "title": "Defend!",
                        "description": {
                            "type": "static",
                            "text": "The surgeon has accused you of being a dog!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork!",
                                "B": "Wag!",
                                "C": "Push!",
                                "D": "Smell!"
                            }
                        }
                    },
                    {
                        "title": "Fail!",
                        "description": {
                            "type": "static",
                            "text": "You [LAST_CHOICE] The defense fails!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Rejection!",
                        "description": {
                            "type": "static",
                            "text": "The surgeon is calling security!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Oh no",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Ejection!",
                        "description": {
                            "type": "static",
                            "text": "You were kicked out of the hospital!",
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bus",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                ]
            },
        ]
    },
    {
        "name": "Cutscene 2",
        "rounds": [
            {
                "name": "Bus",
                "scenes": [{
                    "title": "Moving!",
                    "description": {
                        "type": "static",
                        "text": "You get on the bus again! The next stop is a *restaurant*."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Ride",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "bus"
                },
                {
                    "title": "Ejection!",
                    "description": {
                        "type": "static",
                        "text": "The driver noticed you were a dog!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "ejected"
                }
            ]}
        ]
    },
    {
        "name": "Restaurant",
        "rounds": [{
            "name": "Restaurant Intro",
            "scenes": [
                {
                    "title": "Manager:",
                    "description": {
                        "type": "static",
                        "text": "Chef Sven! Where have you been?"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Bork",
                            "B": "Wag",
                            "C": "Push",
                            "D": "Smell"
                        }
                    },
                    "image": "chefSven"
                },
                {
                    "title": "Manager:",
                    "description": {
                        "type": "static",
                        "text": "I don't care about [LAST_CHOICE]! There are customers waiting!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Bork...",
                            "B": "Wag...",
                            "C": "Push...",
                            "D": "Smell..."
                        }
                    }
                },
                {
                    "title": "Manager:",
                    "description": {
                        "type": "static",
                        "text": "Here's your first order. Go!"
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
            "name": "Cooking Game",
            "scenes": [
                {
                    "title": "Cook!",
                    "description": {
                        "type": "random",
                        "text": [
                            ["The order says..."],
                            ["*hamburger!*", "*salad!*", "*chips!*", "*pizza!*", "*cake!*"],
                            ["How will you cook it?"]
                        ]
                    },
                    "choices": {
                        "type": "random",
                        "selection": [
                            "Boil",
                            "Poach",
                            "Fry",
                            "Bake",
                            "Broil",
                            "Toast",
                            "BBQ",
                            "Burn",
                            "Steam"
                        ]
                    }
                },
                {
                    "title": "Cook!",
                    "description": {
                        "type": "static",
                        "text": "Throw in some..."
                    },
                    "choices": {
                        "type": "random",
                        "selection": [
                            "Egg",
                            "Flour",
                            "Milk",
                            "Cheese",
                            "Yeast",
                            "Carrot",
                            "Tomato"
                        ]
                    }
                },
                {
                    "title": "Cook!",
                    "description": {
                        "type": "static",
                        "text": "[LAST_CHOICE]! Looks tasty!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    }
                },
                {
                    "title": "Cook!",
                    "description": {
                        "type": "static",
                        "text": "Chop up some..."
                    },
                    "choices": {
                        "type": "random",
                        "selection": [
                            "Apple",
                            "Banana",
                            "Egg",
                            "Plum",
                            "Salt",
                            "Pepper"
                        ]
                    }
                },
                {
                    "title": "Cook!",
                    "description": {
                        "type": "static",
                        "text": "[LAST_CHOICE]! What a great combination!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    }
                },
                {
                    "title": "Cook!",
                    "description": {
                        "type": "static",
                        "text": "Add a dash of..."
                    },
                    "choices": {
                        "type": "random",
                        "selection": [
                            "Sand",
                            "Dirt",
                            "Grass",
                            "Sticks",
                            "Mud",
                            "Hair",
                            "Leaves"
                        ]
                    }
                },
                {
                    "title": "Done!",
                    "description": {
                        "type": "static",
                        "text": "In a finishing touch, you stir in the [LAST_CHOICE]."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    }
                }
            ]
        },
        {
            "name": "Restaurant Outro",
            "scenes": [
                {
                    "title": "Customer:",
                    "description": {
                        "type": "static",
                        "text": "This is the worst thing I've ever eaten!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Bork",
                            "B": "Wag",
                            "C": "Push",
                            "D": "Smell"
                        }
                    }
                },
                {
                    "title": "Manager:",
                    "description": {
                        "type": "static",
                        "text": "Sven! I never really hired you, but..."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    }
                },
                {
                    "title": "Manager:",
                    "description": {
                        "type": "static",
                        "text": "You're fired!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Leave",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "ejected"
                }
            ]
        }]
    },
    {
        "name": "Cutscene 3",
        "rounds": [
            {
                "name": "Bus",
                "scenes": [{
                    "title": "Moving!",
                    "description": {
                        "type": "static",
                        "text": "You get on the bus again! The next stop is the *court*."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Ride",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "bus"
                },
                {
                    "title": "Ejection!",
                    "description": {
                        "type": "static",
                        "text": "Don't lick the seats!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "ejected"
                }
            ]}
        ]
    },
    {
        "name": "Court",
        "rounds": [
            {
                "name": "Court Intro",
                "scenes": [
                    {
                        "title": "Man:",
                        "description": {
                            "type": "static",
                            "text": "Help! My lawyer didn't show up!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        },
                        "image": "lawSven"
                    },
                    {
                        "title": "Man:",
                        "description": {
                            "type": "static",
                            "text": "You'll represent me? Okay!"
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
                "name": "Court Game",
                "scenes": [
                    {
                        "title": "Judge:",
                        "description": {
                            "type": "static",
                            "text": "Why is your lawyer a dog?"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Man:",
                        "description": {
                            "type": "static",
                            "text": "My lawyer is not a dog!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Judge:",
                        "description": {
                            "type": "static",
                            "text": "Fair enough. I can see that now."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Judge:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["Where were you on"],
                                ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                                ["15th", "1st", "21st", "17th", "22nd", "3rd"],
                                ["at"],
                                ["2pm?", "1am?", "3:23am?", "4:12am?", "10pm?"]
                            ]
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Opposition:",
                        "description": {
                            "type": "static",
                            "text": "[LAST_CHOICE]? A likely story!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Tension!",
                        "description": {
                            "type": "static",
                            "text": "The jury murmurs intensely."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Opposition:",
                        "description": {
                            "type": "static",
                            "text": "Quit murmuring already! I'm calling a witness!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Witness:",
                        "description": {
                            "type": "random",
                            "text": [
                                ["Impossible! I saw you at"],
                                ["the pub", "maccas", "costa", "the pet store", "sainos", "tescos", "my house"],
                                ["doing crimes!"]
                            ]
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Judge:",
                        "description": {
                            "type": "static",
                            "text": "Explain yourself!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Alibi!",
                        "description": {
                            "type": "static",
                            "text": "Quick! What's your alibi?"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Bork",
                                "B": "Wag",
                                "C": "Push",
                                "D": "Smell"
                            }
                        }
                    },
                    {
                        "title": "Judge:",
                        "description": {
                            "type": "static",
                            "text": "Huh... but is the jury convinced?"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Jury!",
                        "description": {
                            "type": "static",
                            "text": "The jury murmurs intensely."
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Jury:",
                        "description": {
                            "type": "static",
                            "text": "Not guilty!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Next",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        }
                    },
                    {
                        "title": "Judge:",
                        "description": {
                            "type": "static",
                            "text": "Now get out of my court!"
                        },
                        "choices": {
                            "type": "static",
                            "selection": {
                                "A": "Leave",
                                "B": null,
                                "C": null,
                                "D": null
                            }
                        },
                        "image": "ejected"
                    },
                ]
            }
        ]
    },
    {
        "name": "Cutscene 4",
        "rounds": [
            {
                "name": "Bus",
                "scenes": [{
                    "title": "Moving!",
                    "description": {
                        "type": "static",
                        "text": "You get on the bus again! The next stop is your *home*."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Ride",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "bus"
                },
                {
                    "title": "Ejection!",
                    "description": {
                        "type": "static",
                        "text": "Don't sit on other passengers!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Next",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    },
                    "image": "ejected"
                },
                {
                    "title": "Home...",
                    "description": {
                        "type": "static",
                        "text": "You go up to the door. Someone is inside now..."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Bork",
                            "B": "Wag",
                            "C": "Push",
                            "D": "Smell"
                        }
                    },
                    "image": "theEnd"
                },
                {
                    "title": "Home!",
                    "description": {
                        "type": "static",
                        "text": "The person inside notices your [LAST_CHOICE] through the door!"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Bork",
                            "B": "Wag",
                            "C": "Push",
                            "D": "Smell"
                        }
                    }
                },
                {
                    "title": "Person:",
                    "description": {
                        "type": "static",
                        "text": "Sven! How did you get outside?"
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Bork",
                            "B": "Wag",
                            "C": "Push",
                            "D": "Smell"
                        }
                    }
                },
                {
                    "title": "Person:",
                    "description": {
                        "type": "static",
                        "text": "At least you didn't get up to much..."
                    },
                    "choices": {
                        "type": "static",
                        "selection": {
                            "A": "Menu",
                            "B": null,
                            "C": null,
                            "D": null
                        }
                    }
                }
            ]}
        ]
    },]
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
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var messages = [];
var users = []; 
var notes = [ { titleMes: `"Pattern 'Proxy'"`, bodyNote: `"JavaScript has new feature Proxy since ES2015"` }];


// Патерн Facade 

    class saveNoteTitle {

        checkTitleSaving(message) {                             
            const splitMessageToArray = message.split(`\"`);
            return splitMessageToArray[0].trim() == "Save note title:";
        }

        add(message) {
            const re = /"(\\.|[^"\\])*"/g;
            const getArrayOfNoteData = message.match(re);
            let checkTitleOfNote = true;
            
            if(notes.length) {
                checkTitleOfNote = notes.every(function(item) {
                    return item.titleMes.trim() != getArrayOfNoteData[0].trim()
                }) 
            }

            if(getArrayOfNoteData.length == 2 && checkTitleOfNote){
                
                let title = getArrayOfNoteData[0];
                let bodyNote = getArrayOfNoteData[1];

                notes.push({titleMes: title, bodyNote: bodyNote});
                return `Запис ${title} було додано`

            } else {
                return false
            }
        }

    }

    class showNoteList {
        checkNotesShowing(message) {
            return message == "Show note list" ? true : false;
        }
        show() {

            if(notes.length) {
                let result = notes.reduce(function(fullMes, current) {
                    return fullMes + ' ' + current.titleMes + ' ' + current.bodyNote + '\n';
                }, "")
                return result;
            } else {
                return false
            }

        }
    }

    // @bot Save note title: "Pattern 'Proxy'" body: "JavaScript has new feature Proxy since ES2015"
    // @bot Show note "Pattern 'Proxy'"

    class showNoteTitle {

        checkNotesByTitle(message) {
            const splitMessageToArray = message.split('\"');
            return splitMessageToArray[0].trim() == "Show note";
        }

        showByTitle(message) {

            const re = /"(\\.|[^"\\])*"/g;
            const getArrayOfNoteData = message.match(re);
            if(getArrayOfNoteData.length == 1) {
                const title = getArrayOfNoteData[0];
                const foundNote = notes.filter(item => item.titleMes == title);
                return foundNote.length ? ` It is a title: ${foundNote[0].titleMes} and a body: ${foundNote[0].bodyNote}` : false;
            } else {
                return false
            }
        }
    }

    class deleteNote {

        checkNoteBeforeDelete(message) {
            const splitMessageToArray = message.split('\"');
            return splitMessageToArray[0].trim() == "Delete note";
        } 

        deleteNoteByTitle(message) {
            const re = /"(\\.|[^"\\])*"/g;
            const getArrayOfNoteData = message.match(re);
            console.log(getArrayOfNoteData.length);
            if(getArrayOfNoteData.length == 1) {
                const title = getArrayOfNoteData[0];
                console.log(notes.filter(item => item.titleMes != title));
                notes = notes.filter(item => item.titleMes != title);
                return `Note with ${title} was deleted`
            } else {
                return false
            }
        }
    }

    class ManagingNote {
        constructor(customerName) {
            this.customerName = customerName;
        }

        handleNote(message) {

            const isSaveNoteTitle = new saveNoteTitle().checkTitleSaving(message);
            console.log(isSaveNoteTitle);
            const saveMessage = isSaveNoteTitle ? new saveNoteTitle().add(message) : false;

            const isShowNoteList = new showNoteList().checkNotesShowing(message);
            const showListOfNote = isShowNoteList ? new showNoteList().show() : false;

            const isShowNotesByTitle = new showNoteTitle().checkNotesByTitle(message);
            const showNoteByTitle = isShowNotesByTitle ? new showNoteTitle().showByTitle(message) : false;

            const isDeletedFileExist = new deleteNote().checkNoteBeforeDelete(message);
            const deleteFileByTitle = isDeletedFileExist ? new deleteNote().deleteNoteByTitle(message) : false;

            let getAnswer = saveMessage || showListOfNote || showNoteByTitle || deleteFileByTitle; // Тут, якщо якийсь запит пройшов усішнно, то я його поверну
            
        return !!getAnswer ? this.customerName + ' ' + getAnswer : getAnswer;                                                                     // Якщо такого запиту не буде я поверну false, що значить не знайдено
        }
    }

// Кінець реалізації патерна Facade


// Нижче реалізується патерн Factory

class Quotes {            
    constructor() {
        this.tips = [
            'Java относится к JavaScript так же, как Сом к Сомали.',
            'Это не баг — это незадокументированная фича.',
            'Плохое ПО одного человека — постоянная работа другого.',
            'Если сразу не получилось хорошо, назовите это версией 1.0.',
            'Не волнуйся, если не работает. Если бы все всегда работало, у тебя бы не было работы.'
        ];
    }
}

class Advises {
    constructor() {
        this.tips = [
            'Той, хто сміється останнім, можливо не зрозумів жарту.',
            'Як багато можна цікавого почути, якщо частіше мовчати.',
            'Посмішка має ефект дзеркала - посміхнися і ти побачиш посмішку...',
            'Рухайся не поспішаючи, але завжди тільки вперед.',
            'Старайся! І у тебе все обов\'язково вийде.'
        ]
    }
}

class getTip {
    create (type) {
      let tip;
      if (type === 'show quote') {
        tip = new Quotes()
      } else if (type === '#@)₴?$0') {
        tip = new Advises()
      } 

      if(tip != undefined) {
        
        tip.type = type

        tip.getMessage = function () {
  
              const minCountOfTips = 0;
              const maxCountOfTips = this.tips.length - 1;
              const getRoundomNumberOfTip = Math.floor(Math.random() * (maxCountOfTips - minCountOfTips + 1)) + minCountOfTips;
              const getStringOfTipByNumber = this.tips[getRoundomNumberOfTip];
  
              return getStringOfTipByNumber;
        }

        return tip;
      } else {
        return false
      }
    }
  }

// Кінець реалізації патерна Factory

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/script.js", function(req, res) {
    res.sendFile(__dirname + "/script.js");
});

app.get("/style.css", function(req, res) {
    res.sendFile(__dirname + "/style.css");
});

io.on("connection", function(socket) {

    console.log("client connected");

    function changeStatusOnline(user) {
        if(user.status == "just appeared") {
            user.status = "online";
            io.emit("change status",  user);
        }
    }

    function changeStatusOffline(user) {
        if(user.status == "just left") {
            user.status = "offline";
            io.emit("change status",  user);
        }
    }

    socket.on("typing", function(data) {
        if(data.lengthMes != 0 && data.focus) {
            socket.broadcast.emit("typing", `<p><em>${data.nick} is typing a message...</em></p>`);
        } else {
            socket.broadcast.emit("typing", "");
        }
    });

    

    socket.on("chat user", function(newUser) {

        if(newUser.name.length != 0 && newUser.nickname.length != 0) {
            var coincidence = false;

            for(let i = 0; i < users.length; i++) {
                if(users[i].nickname == newUser.nickname) {
                    if(users[i].name == newUser.name) {
                        if(users[i].status != "online" && users[i].status != "just appeared") {
                            console.log(users[i].status);
                            setTimeout(changeStatusOnline, 60000, users[i]);
                            users[i].dataInv = new Date();
                            users[i].status = "just appeared";
                            users[i].id = socket.id;
                            io.emit("change status",  users[i]);
                            io.emit("change position message", users);
                            coincidence = true;
                            socket.emit("chat history current user", {msg: messages, nick: users[i].nickname});
                            socket.emit("chat user invite");
                            socket.emit("adding user",  users);
                        } else {
                            socket.emit("incorrect fields", "This user is online currently");
                            coincidence = true;
                        }
                    } else {
                        socket.emit("incorrect fields", "Incorrect name for this nick");
                        coincidence = true;
                    }
                }
            }
    
            if(!coincidence) {
                setTimeout(changeStatusOnline, 60000, newUser);
                newUser.dataInv = new Date();
                newUser.status = "just appeared";
                newUser.id = socket.id;
                users.push(newUser);
                io.emit("chat user", newUser);
              //  io.emit("change position message", newUser);
                socket.emit("chat history current user", {msg: messages, nick: newUser.nickname});
                socket.emit("chat user invite");
                socket.emit("adding user",  users);
            }
        } else {
            socket.emit("incorrect fields", "Your data either incorrect or empty");
        }
    })

    socket.on("chat message", function(msg) {
        if(messages.length == 100) {
            messages.splice(0, 1);
        }
        if(msg.text.length == 0) {
            socket.emit("incorrect fields", "Your message is empty");
        } else {
            messages.push(msg);
            io.emit("chat message", msg);
            socket.emit("chat history current user", {msg: messages, nick: msg.nickname});
        }
    });

    function returnSpecialSymbols(message) {

        const result = message.filter(item => item == '#@)₴?$0');
        
        if(result.length) {    // Якщо є співпадіння з #@)₴?$0 то довжина буде більше нуля
            return result
        } else {
            return message
        }

    }

    function getRequestToBot(message, checkSpecialSymbols) {   
        
        const splitMessageToArray = message.split(' ');

        const cutNameBot = splitMessageToArray.filter(item => item != '@bot');

        const checkingBySymbols = checkSpecialSymbols.call(null, cutNameBot);

        const stringBodyMessage = checkingBySymbols.join(' ');

        return stringBodyMessage;

    }

    socket.on("chat message bot", function(msg) {
        if(messages.length == 100) {
            messages.splice(0, 1);
        }
        if(msg.text.length == 0) {
            socket.emit("incorrect fields", "Your message is empty");
        } else {
            
            bodyMessageFromBot = getRequestToBot(msg.text, returnSpecialSymbols)

            let messageOfBotAnswer = '';

            const note = new ManagingNote(msg.nickname);

            const changeNotesDependsToRequest = note.handleNote(bodyMessageFromBot);

            messageOfBotAnswer = changeNotesDependsToRequest ? changeNotesDependsToRequest : false;

            if(!!messageOfBotAnswer == false) {
                const tip = new getTip();
            
                createTipDependsToRequest = tip.create(bodyMessageFromBot);
                
                messageOfBotAnswer = createTipDependsToRequest ? createTipDependsToRequest.getMessage() : false;
            }
            
            if(messageOfBotAnswer == false) {
                messageOfBotAnswer = 'Помилка вводу';
            }
            
            const answerBot = {
                name: '@bot',
                nickname: 'bot',
                text: messageOfBotAnswer,
                time: new Date()
            }

            messages.push(msg);
            io.emit("chat message", msg);
            messages.push(answerBot);
            io.emit("chat message", answerBot);
            socket.emit("chat history current user", {msg: messages, nick: msg.nickname});
        }
    });

    socket.on('disconnect', function(){
        for(let i = 0; i < users.length; i++) {
            if(users[i].id == socket.id) {
                console.log(`${users[i].nickname} is disconnected`);
                users[i].status = "just left"; 
                io.emit("change status",  users[i]);
                setTimeout(changeStatusOffline, 60000, users[i]);
            }
        }
    });
});

http.listen(1428, function() {
    console.log("litening on *:1428");
});
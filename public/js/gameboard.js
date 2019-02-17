//Modal related changes
var characterList = [];
var $characterContainer = $("#container-character");
$(document).ready(function() {
  var socket = io();

  socket.on("startCharSelect", function(turn) {
    $("#playerSelectModelId").attr("data-turn", turn);
    $("#select-char").attr("data-player", turn);
    $("#character-turn").text(turn);
    refreshCharacters();
  });

  var playerNum;
  $("#end-turn").hide();

  $.get("/api/players", function(data) {
    playerNum = data.length;
    $(".player-num")
      .text(playerNum)
      .attr("data-player", playerNum);

    console.log(data.length);
    if (data.length === 4) {
      console.log("start 0");
      socket.emit("startCharSelect", data);
      //socket.emit("startGame", data);
    }
  });

  socket.on("startGame", function(playerData) {
    $("#playerSelectModelId").modal("toggle");
    console.log(playerData);
    $.get("/api/board", function(data) {
      for (var i = 0; i < playerData.length - 1; i++) {
        var newPlayerDiv = $("<div>");
        newPlayerDiv
          .addClass("player" + playerData[4][i] + "card")
          .addClass("player-card")
          .attr("id", "player-card-" + playerData[4][i]);

        if (i === 0) {
          newPlayerDiv.addClass("turn-active-card");
        }
        newPlayerDiv.append("<h5>Player " + playerData[4][i] + "</h5>");
        newPlayerDiv.append("<p>Score: 0</p>");
        $("#player-col").append(newPlayerDiv);
      }

      board = JSON.parse(data[0].boardSpots);
      var paths = JSON.parse(data[0].imagePaths);
      console.log(data[0]);

      var boardSpot = [];
      console.log(board);

      $(".validMove").removeClass("validMove");
      $(".hasPlayer").removeClass("hasPlayer");
      $(".hasItem").removeClass("hasItem");

      for (var i = 0; i < board.spots.length; i++) {
        if (board.spots[i].hasItem) {
          $("#" + i).addClass("hasItem");
        }
        if (board.spots[i].hasPlayer) {
          $("#" + i).addClass("hasPlayer");
          switch (board.spots[i].playerId) {
            case 1:
              $("#" + i)
                .addClass("player1")
                .css("background-image", "url(" + paths.p1 + ")");
              break;
            case 2:
              $("#" + i)
                .addClass("player2")
                .css("background-image", "url(" + paths.p2 + ")");
              break;
            case 3:
              $("#" + i)
                .addClass("player3")
                .css("background-image", "url(" + paths.p3 + ")");
              break;
            case 4:
              $("#" + i)
                .addClass("player4")
                .css("background-image", "url(" + paths.p4 + ")");
              break;
          }

          console.log(
            board.spots[i].playerId + ", " + parseInt(playerData[4][0])
          );

          if (board.spots[i].playerId === parseInt(playerData[4][0])) {
            boardSpot = board.spots[i].validMoves;
          }
        }
      }
      $("#end-turn").hide();
      $(".player-turn").text(playerData[4][0]);
      changeTurn(parseInt(playerData[4][0]), boardSpot);
    });
  });

  function changeTurn(turn, boardSpot) {
    console.log("Current turn: " + turn + ", Your player num: " + playerNum);
    if (turn === playerNum) {
      for (var i = 0; i < boardSpot.length; i++) {
        if (!$("#" + boardSpot[i]).hasClass("hasPlayer")) {
          $("#" + boardSpot[i]).addClass("validMove");
        }
      }
      $("#end-turn").show();
      console.log("your turn");
    }
  }

  $(document).on("click", ".validMove", function() {
    var newLocation = parseInt($(this).attr("id"));
    var newBoardState = { newPosition: newLocation, playerId: playerNum };
    $.ajax("/api/board", {
      type: "PUT",
      data: newBoardState,
      success: function(data) {
        console.log(data);
        socket.emit("playerMove", playerNum);
      }
    });
  });

  socket.on("startTurn", function(turn) {
    $(".turn-active-card").removeClass("turn-active-card");
    $("#player-card-" + turn).addClass("turn-active-card");
    $.get("/api/board", function(data) {
      board = JSON.parse(data[0].boardSpots);
      var paths = JSON.parse(data[0].imagePaths);
      var boardSpot = [];
      console.log(board);

      $(".validMove").removeClass("validMove");
      $(".hasPlayer").removeClass("hasPlayer");
      $(".player" + turn).removeClass("player" + turn);
      $(".hasItem").removeClass("hasItem");

      for (var i = 0; i < board.spots.length; i++) {
        if (board.spots[i].hasItem) {
          $("#" + i).addClass("hasItem");
        }
        if (board.spots[i].hasPlayer) {
          $("#" + i).addClass("hasPlayer");

          if (board.spots[i].playerId === turn) {
            var path = paths["p" + turn];
            console.log(path);
            $("#" + i)
              .addClass("player" + turn)
              .css("background-image", "url(" + path + ")");
            boardSpot = board.spots[i].validMoves;
          }
        }
      }
      $("#end-turn").hide();
      $(".player-turn").text(turn);
      changeTurn(turn, boardSpot);
    });
  });

  socket.on("changeTimer", function(secondsLeft) {
    var max = $(".progress-bar").attr("aria-valuemax");
    var percent = (secondsLeft / max) * 100;
    $(".progress-bar").attr("aria-valuenow", secondsLeft);
    $(".progress-bar").css("width", percent + "%");
  });

  $("#end-turn").click(function() {
    socket.emit("endTurn", playerNum);
  });

  socket.on("clickCharacter", function() {
    refreshCharacters();
  });

  function refreshCharacters() {
    $.get("/api/characters", function(data) {
      characterList = data;
      console.log(characterList);
      initializeRows();
      $("#playerSelectModelId").modal({ backdrop: "static", keyboard: false });
    });
  }

  function initializeRows() {
    $characterContainer.empty();
    var rowsToAdd = [];
    for (var i = 0; i < characterList.length; i++) {
      rowsToAdd.push(createNewCharCard(characterList[i]));
    }
    console.log(rowsToAdd);
    $characterContainer.prepend(rowsToAdd);
    console.log($characterContainer);
  }

  function createNewCharCard(character) {
    //Creating individual character
    var playerCardSpan = $("<span>");
    playerCardSpan.attr("class", "player-card");
    playerCardSpan.attr("id", character.id);

    var divImgWell = $("<div>");
    divImgWell.attr("class", "well well-custom");

    var figName = $("<figure>");
    figName.attr("class", "text-center font-weight-bold");
    figName.text(character.character_name);

    var divImg2 = $("<div>");
    divImg2.attr("class", "charAImg");

    //creating img tag
    var charImg = $("<img>");
    var path = character.character_name.replace(/\s/g, "");
    charImg.attr("src", ["/images/", path, ".png"].join(""));
    charImg.attr("id", ["img-", character.id].join(""));
    charImg.attr("class", "resize");
    if (!character.charSelected) {
      charImg.attr("class", "resize char-img");
    }
    charImg.attr("activeFlag", character.activeFlag);

    //if currently active/selected, disable it
    if (character.activeFlag === "Y") {
      if (character.charSelected) {
        charImg.addClass("char-chosen");
      } else {
        charImg.addClass("char-selected");
      }
    }

    var figName2 = $("<figure>");
    figName2.attr("class", "text-center font-weight-bold");
    figName2.text("Attack :" + character.attack);

    var figName3 = $("<figure>");
    figName3.attr("class", "text-center font-weight-bold");
    figName3.text("Weapon :" + character.Item.item_name);

    divImg2.prepend(charImg);
    divImgWell.prepend(figName3);
    divImgWell.prepend(figName2);
    divImgWell.prepend(divImg2);
    divImgWell.prepend(figName);
    playerCardSpan.prepend(divImgWell);

    return playerCardSpan;
  }

  $(document).on("click", ".char-img", function() {
    var turn = $("#playerSelectModelId").attr("data-turn");
    var playerNum = $(".player-num").attr("data-player");
    console.log("turn: " + turn + ", playerNum: " + playerNum);
    if (parseInt(turn) === parseInt(playerNum)) {
      //alert("image clicked" + $(this).attr("id"));

      var idstr = $(this).attr("id");
      var idarr = idstr.split("-");
      var imgFlag = $(this).attr("activeFlag");
      var flagToset = "";
      var charSelectedVar = false;

      // setting activeFlag based on current flag
      if (imgFlag === "Y") {
        flagToset = "N";
      } else {
        flagToset = "Y";
      }

      if (flagToset === "Y") {
        charSelectedVar = true;
      } else {
        charSelectedVar = false;
      }
      var character = {
        activeFlag: flagToset,
        charSelected: false,
        id: idarr[1]
      };
      //updating active flag to database, character table
      updateActiveFlag(character);
    }
  });

  function updateActiveFlag(character) {
    $.ajax({
      method: "PUT",
      url: "/api/characters",
      data: character
    }).then(function() {
      socket.emit("clickCharacter");
    });
  }

  $("#select-char").click(function() {
    var idstr = $(".char-selected").attr("id");
    var turn = $("#select-char").attr("data-player");
    var idarr = idstr.split("-");
    var character = {
      activeFlag: "Y",
      charSelected: true,
      id: idarr[1]
    };
    var turnAndId = {
      playerTurn: turn,
      id: idarr[1]
    };
    $.ajax({
      method: "PUT",
      url: "/api/characters",
      data: character
    }).then(function() {
      socket.emit("selectCharacter", turnAndId);
    });
  });
});

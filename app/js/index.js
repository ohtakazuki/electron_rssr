const LIST_KEY = "msglist";
const MSG_MAX = 100;
var msglist;
var sitename;

jQuery(function($){
    // データ削除
    // localStorage.removeItem(LIST_KEY);

    // サイト一覧の組み立て
    (function(){
        const SITES_KEY = "sitelist";
        var sitelist = JSON.parse(localStorage.getItem(SITES_KEY));
        var area = $(".sites_area");
        $(area).empty();
        for(var cnt in sitelist) {
            $("<a>" + sitelist[cnt].title + "</a>").attr({"class": "site", "href": sitelist[cnt].href}).appendTo(area);
            $("<br>").appendTo(area);
        }
    }());

    // 稼働可能パネル
    $('div.split-pane').splitPane();
    
    // siteをクリックしたらメッセージリストを表示
    $(document).on("click", ".site", loadList);

    // メッセージの件名をクリックしたら内容表示
    $(document).on("click", "td.author", loadWeb);
    $(document).on("click", "td.title", loadWeb);
    $(document).on("click", "td.date", loadWeb);
    $(document).on("click", "td.favorite", tglFavorite);
});

/**----------------------------------------
 * お気に入り
 ----------------------------------------*/
function tglFavorite() {
    var href = $(this).parent().attr("data-href");
    // 切り替え
    var flg = $(this).text() == "☆";
    if(flg) {
        $(this).html("<span class='star'>★</span>");
    } else {
        $(this).text("☆");
    }
    // localStrageに反映
    for(var cnt in msglist) {
        if(href == msglist[cnt].href) {
            msglist[cnt].favorite = flg;
        }
    }
    localStorage.setItem(LIST_KEY+sitename, JSON.stringify(msglist));
    return false;
}

/**----------------------------------------
 * タイトルクリック時の処理。tdなので注意
 ----------------------------------------*/
function loadWeb() {
    $("tr").removeClass("tractive");
    $(this).parent().addClass("tractive");

    var href = $(this).parent().attr("data-href");

    if($(this).parent().hasClass("unread")){
        $(this).parent().removeClass("unread");
        // localStrageに反映
        for(var cnt in msglist) {
            if(href == msglist[cnt].href) {
                msglist[cnt].read = true;
            }
        }
        localStorage.setItem(LIST_KEY+sitename, JSON.stringify(msglist));
    }

    // reset_webview_wrapper
    var wrap = document.getElementById("bottom-component");
    wrap.removeChild(wrap.lastChild);

    // ElectronのWebView(ブラウザ)を作成する
    var newWebview = document.createElement("webview");
    newWebview.id = "webview";
    newWebview.setAttribute("src",href);

    // append new_webview
    wrap.appendChild(newWebview);

    return false;
}

/**----------------------------------------
 * siteクリック時の処理
 ----------------------------------------*/
function loadList() {
    $(".site").removeClass("siteactive");
    $(this).addClass("siteactive");
    // この場合のthisもイベント発生元になる
    sitename = $(this).text();

    // 保存済メッセージ、最大日付の取得
    var maxDatetime;
    msglist = JSON.parse(localStorage.getItem(LIST_KEY+sitename));
    if(msglist && msglist.length > 0){
        maxDatetime = new Date(msglist[0].datetime);
    } else {
        msglist = [];
        maxDatetime = new Date(0);
    }

    var url = $(this).attr("href");
    $.get(url, function (data) {
        // RSSフィードからメッセージを取得し、リストに追記
        var ary = [];
        $(data).find("item").each(function () {
            // 要素の値の取得
            var el = $(this);
            var author = el.find("creator").text() || sitename;
            var title = el.find("title").text();
            var href = el.find("link").text();
            var datetime = new Date(el.find("date").text() || el.find("pubDate").text());
            if(maxDatetime < datetime){
                ary.push({
                    author: author,
                    title: title,
                    href: href,
                    datetime: datetime,
                    favorite: false,
                    read: false
                });
            }
        });
        msglist = ary.concat(msglist);
        if(msglist.length > MSG_MAX){
            // 上限数を超えた場合
            var m = msglist.length - MSG_MAX;
            var d = 0;
            for (var i = msglist.length; i--; ) {
                if(!msglist[i-1].favorite){
                    msglist.splice(i-1, 1);
                    d++;
                }
                if(d>=m){
                    break;
                }
            }
        }

        // テーブルの組み立て
        $("#top-component tbody").empty();
        for(var cnt in msglist) {
                var getNowTime = new Date(msglist[cnt].datetime),
                    ye = getNowTime.getFullYear(),          // 年
                    mo = getNowTime.getMonth(),             // 月
                    da = getNowTime.getDate(),              // 日
                    hh = dispTime(getNowTime.getHours()),   // 時 (dispTimeで二桁表示)
                    mm = dispTime(getNowTime.getMinutes()), // 分 (dispTimeで二桁表示)
                    ss = dispTime(getNowTime.getSeconds()), // 秒 (dispTimeで二桁表示)
                    pDateTime = ye + "/" + (mo + 1) + "/" + da + " " + hh + ":" + mm;

                var tr = $("<tr></tr>", {"data-href": msglist[cnt].href, "class": msglist[cnt].read ? "" : "unread"});
                $("<td>" + msglist[cnt].author + "</td>").attr({"class": "author"}).appendTo(tr);
                $("<td>" + msglist[cnt].title + "</td>").attr({"class": "title"}).appendTo(tr);
                $("<td>" + pDateTime  + "</td>").attr({"class": "date"}).appendTo(tr);
                $("<td>" + (msglist[cnt].favorite ? "<span class='star'>★</span>" : "☆") + "</td>").attr({"class": "favorite"}).appendTo(tr);
                tr.appendTo($("#top-component tbody"));
        }
        localStorage.setItem(LIST_KEY+sitename, JSON.stringify(msglist));

        // reset_webview_wrapper
        var wrap = document.getElementById("bottom-component");
        wrap.removeChild(wrap.lastChild);

        // ElectronのWebView(ブラウザ)を作成する
        var newWebview = document.createElement("webview");
        newWebview.id = "webview";
        newWebview.setAttribute("src","");

        // append new_webview
        wrap.appendChild(newWebview);

        $("#top-component").scrollTop();
    });

    return false;
}

/**----------------------------------------
 * 時刻表示を二桁に設定（例：１時5分(1:5)->01:05）
 * @param {*} num 
 ----------------------------------------*/
function dispTime(num) {
    if (num <= 9) {
        num = "0" + num;
    }
    return num;
}


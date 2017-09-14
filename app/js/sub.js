const SITES_KEY = "sitelist";
var sitelist;

jQuery(function($){
    loadSite();
    // データ削除
    // localStorage.removeItem(SITES_KEY);

    // 追加ボタン
    $(document).on("click", "#add", function(){
        if($("#add_title").val().length > 0 && $("#add_href").val().length > 0){
            var tr = $("<tr></tr>");
            $("<td class='title'>" + $("#add_title").val() + "</td>").appendTo(tr);
            $("<td class='href'>" + $("#add_href").val() + "</td>").appendTo(tr);
            $("<td><button type='button' class='btn btn-danger delbtn'>削除</button></td>").appendTo(tr);
            tr.appendTo($("table tbody"));

            $("#add_title").val("");
            $("#add_href").val("");
        } else {
            alert('サイト名とアドレスを入力してください。');
        }
    });

    // 削除ボタン
    $(document).on("click", ".delbtn", function() {
        $(this).parent().parent().remove();
    });

    // 保存ボタン
    $(document).on("click", "#save", function() {
        var sitelist = [];

        $("table tbody tr").each(function(index){
            var title = $(this).find(".title").text();
            var href = $(this).find(".href").text();
            if(title.length > 0 && href.length > 0){
                sitelist.push({
                    title: title,
                    href: href
                })
                console.log("insert " + this);
            } else {
                console.log("dont insert " + this);
            }
        });

        localStorage.setItem(SITES_KEY, JSON.stringify(sitelist));
        window.location.href = "index.html";
    });
});

/**----------------------------------------
 * サイト一覧の取得
 ----------------------------------------*/
function loadSite() {
    sitelist = JSON.parse(localStorage.getItem(SITES_KEY));

    if(!sitelist){
        sitelist = [];
    }

    for(var cnt in sitelist) {
        // テーブルの組み立て
        $("table tbody").empty();
        for(var cnt in sitelist) {
            var tr = $("<tr></tr>");
            $("<td class='title'>" + sitelist[cnt].title + "</td>").appendTo(tr);
            $("<td class='href'>" + sitelist[cnt].href + "</td>").appendTo(tr);
            $("<td><button type='button' class='btn btn-danger delbtn'>削除</button></td>").appendTo(tr);
            tr.appendTo($("table tbody"));
        }
    }
}

(function () {
    $.magicCanvas.draw({
        lineLen: 18,
        heartBeatCD: 3000,
        heartBeatRange: 300,
        type: "heart-beat",
        rgb: function (circlePos, heartBeatCenter) {
            var px = circlePos.x; // a point on boom circle
            var py = circlePos.y;
            var hbcx = heartBeatCenter.x;
            var hbcy = heartBeatCenter.y;
            var dis = Math.pow((px - hbcx), 2) + Math.pow((py - hbcy), 2);
            var maxDis = 300 * 300;
            var r = parseInt(255 * dis / maxDis);
            // do some computation....
            return {
                r: 54,
                g: 100,
                b: 139
            };
        }
    })
})();
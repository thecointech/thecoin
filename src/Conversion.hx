@:expose
@:keep
class Convert {
        
    // Utility fns
    function toCoin(val:Float) { return Math.floor(val * 1000000); }
    function toHuman(val:Int) { return val / 1000000; }
}

// Generated by Haxe 4.0.0-preview.4+1e3e5e016

#pragma warning disable 109, 114, 219, 429, 168, 162
public class Reflect : global::haxe.lang.HxObject {
	
	public Reflect(global::haxe.lang.EmptyObject empty) {
	}
	
	
	public Reflect() {
		global::Reflect.__hx_ctor__Reflect(this);
	}
	
	
	protected static void __hx_ctor__Reflect(global::Reflect __hx_this) {
	}
	
	
	public static object field(object o, string field) {
		global::haxe.lang.IHxObject ihx = ((global::haxe.lang.IHxObject) (( o as global::haxe.lang.IHxObject )) );
		if (( ihx != null )) {
			return ihx.__hx_getField(field, global::haxe.lang.FieldLookup.hash(field), false, false, false);
		}
		
		return global::haxe.lang.Runtime.slowGetField(o, field, false);
	}
	
	
	public static void setField(object o, string field, object @value) {
		global::haxe.lang.IHxObject ihx = ((global::haxe.lang.IHxObject) (( o as global::haxe.lang.IHxObject )) );
		if (( ihx != null )) {
			ihx.__hx_setField(field, global::haxe.lang.FieldLookup.hash(field), @value, false);
		}
		else {
			global::haxe.lang.Runtime.slowSetField(o, field, @value);
		}
		
	}
	
	
	public static global::Array<object> fields(object o) {
		global::haxe.lang.IHxObject ihx = ((global::haxe.lang.IHxObject) (( o as global::haxe.lang.IHxObject )) );
		if (( ihx != null )) {
			global::Array<object> ret = new global::Array<object>(new object[]{});
			ihx.__hx_getFields(ret);
			return ret;
		}
		else if (( o is global::System.Type )) {
			return global::Type.getClassFields(((global::System.Type) (o) ));
		}
		else {
			return global::Reflect.instanceFields(o.GetType());
		}
		
	}
	
	
	public static global::Array<object> instanceFields(global::System.Type c) {
		global::System.Type c1 = ((global::System.Type) (c) );
		global::Array<object> ret = new global::Array<object>(new object[]{});
		global::System.Reflection.BindingFlags this1 = global::System.Reflection.BindingFlags.Public;
		global::System.Reflection.BindingFlags this2 = ((global::System.Reflection.BindingFlags) (( ((global::System.Reflection.BindingFlags) (this1) ) | ((global::System.Reflection.BindingFlags) (global::System.Reflection.BindingFlags.Instance) ) )) );
		global::System.Reflection.BindingFlags this3 = ((global::System.Reflection.BindingFlags) (( ((global::System.Reflection.BindingFlags) (this2) ) | ((global::System.Reflection.BindingFlags) (global::System.Reflection.BindingFlags.FlattenHierarchy) ) )) );
		global::System.Reflection.FieldInfo[] mis = c1.GetFields(((global::System.Reflection.BindingFlags) (this3) ));
		{
			int _g1 = 0;
			int _g = ( mis as global::System.Array ).Length;
			while (( _g1 < _g )) {
				int i = _g1++;
				global::System.Reflection.FieldInfo i1 = mis[i];
				ret.push(( i1 as global::System.Reflection.MemberInfo ).Name);
			}
			
		}
		
		return ret;
	}
	
	
}



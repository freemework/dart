{%
case include.type
%}{%
    when "NativeString"
%}{%
        case include.targetLang
%}{% 
            when "csharp"
%}string{%
            when "dart"
%}String{%
            when "python"
%}str{%
            when "typescript"
%}string{%
        endcase
%}{%
    when "NativeUint16"
%}{%
        case include.targetLang
%}{%
            when "csharp"
%}ushort{%
            when "dart"
%}int{% 
            when "python"
%}int{%
            when "typescript"
%}number{%
        endcase
%}{%
    when "NativeBool"
%}{%
        case include.targetLang
%}{% 
            when "csharp"
%}bool{%
            when "dart"
%}bool{%
            when "python"
%}bool{%
            when "typescript"
%}boolean{%
        endcase
%}{%
    else
%}{{ include.type }}{%
    endcase
%}
/* Format function */
String.prototype.format = function ()
{
    var formatted = this;
    for ( var i = 0; i < arguments.length; i++ )
    {
        var regexp = new RegExp( "\\{" + i + "\\}", "gi" );
        formatted = formatted.replace( regexp, arguments[ i ] );
    }
    return formatted;
};

var __String = {};
__String.echo = function ( param )
{
    let args = Array.prototype.slice.call( arguments );
    return console.log( args.join( ' ' ) );
}
var __Var = {};

/*
    ----- Dumps information about a variable -----
    //   example 1: var_dump(1)
    //   returns 1: 'int(1)'
*/
__Var.var_dump = function ()
{
    let echo = __String.echo;
    let output = '';
    let padChar = ' ';
    let padVal = 4;
    let lgth = 0;
    let i = 0;

    let _getFuncName = function ( fn )
    {
        let name = ( /\W*function\s+([\w$]+)\s*\(/ ).exec( fn );
        if ( !name )
        {
            return '(Anonymous)';
        }
        return name[ 1 ];
    };

    let _repeatChar = function ( len, padChar )
    {
        let str = '';
        for ( let i = 0; i < len; i++ )
        {
            str += padChar;
        }
        return str;
    };

    let _getInnerVal = function ( val, thickPad )
    {
        let ret = '';
        if ( val === null )
        {
            ret = 'NULL';
        } else if ( typeof val === 'boolean' )
        {
            ret = 'bool(' + val + ')';
        } else if ( typeof val === 'string' )
        {
            ret = 'string(' + val.length + ') "' + val + '"';
        } else if ( typeof val === 'number' )
        {
            if ( parseFloat( val ) === parseInt( val, 10 ) )
            {
                ret = 'int(' + val + ')';
            } else
            {
                ret = 'float(' + val + ')';
            }
        } else if ( typeof val === 'undefined' )
        {
            // The remaining are not PHP behavior because these values
            // only exist in this exact form in JavaScript
            ret = 'undefined';
        } else if ( typeof val === 'function' )
        {
            let funcLines = val.toString().split( '\n' );
            ret = '';
            for ( let i = 0, fll = funcLines.length; i < fll; i++ )
            {
                ret += ( i !== 0 ? '\n' + thickPad : '' ) + funcLines[ i ];
            }
        } else if ( val instanceof Date )
        {
            ret = 'Date(' + val + ')';
        } else if ( val instanceof RegExp )
        {
            ret = 'RegExp(' + val + ')';
        } else if ( val.nodeName )
        {
            // Different than PHP's DOMElement
            switch ( val.nodeType )
            {
                case 1:
                    if ( typeof val.namespaceURI === 'undefined' ||
                        val.namespaceURI === 'http://www.w3.org/1999/xhtml' ) 
                    {
                        // Undefined namespace could be plain XML, but namespaceURI not widely supported
                        ret = 'HTMLElement("' + val.nodeName + '")';
                    } else
                    {
                        ret = 'XML Element("' + val.nodeName + '")';
                    }
                    break;
                case 2:
                    ret = 'ATTRIBUTE_NODE(' + val.nodeName + ')';
                    break;
                case 3:
                    ret = 'TEXT_NODE(' + val.nodeValue + ')';
                    break;
                case 4:
                    ret = 'CDATA_SECTION_NODE(' + val.nodeValue + ')';
                    break;
                case 5:
                    ret = 'ENTITY_REFERENCE_NODE';
                    break;
                case 6:
                    ret = 'ENTITY_NODE';
                    break;
                case 7:
                    ret = 'PROCESSING_INSTRUCTION_NODE(' + val.nodeName + ':' + val.nodeValue + ')';
                    break;
                case 8:
                    ret = 'COMMENT_NODE(' + val.nodeValue + ')';
                    break;
                case 9:
                    ret = 'DOCUMENT_NODE';
                    break;
                case 10:
                    ret = 'DOCUMENT_TYPE_NODE';
                    break;
                case 11:
                    ret = 'DOCUMENT_FRAGMENT_NODE';
                    break;
                case 12:
                    ret = 'NOTATION_NODE';
                    break;
            }
        }
        return ret;
    }

    let _formatArray = function ( obj, curDepth, padVal, padChar )
    {
        if ( curDepth > 0 )
        {
            curDepth++;
        }

        let basePad = _repeatChar( padVal * ( curDepth - 1 ), padChar );
        let thickPad = _repeatChar( padVal * ( curDepth + 1 ), padChar );
        let str = '';
        let val = '';

        if ( typeof obj === 'object' && obj !== null )
        {
            if ( obj.constructor && _getFuncName( obj.constructor ) === 'LOCUTUS_Resource' )
            {
                return obj.var_dump();
            }

            lgth = 0;

            for ( let someProp in obj )
            {
                if ( obj.hasOwnProperty( someProp ) )
                {
                    lgth++;
                }
            }

            str += 'array(' + lgth + ') {\n';

            for ( let key in obj )
            {
                let objVal = obj[ key ];
                if ( typeof objVal === 'object' &&
                    objVal !== null &&
                    !( objVal instanceof Date ) &&
                    !( objVal instanceof RegExp ) &&
                    !objVal.nodeName ) 
                {
                    str += thickPad;
                    str += '[';
                    str += key;
                    str += '] =>\n';
                    str += thickPad;
                    str += _formatArray( objVal, curDepth + 1, padVal, padChar );
                } else
                {
                    val = _getInnerVal( objVal, thickPad );
                    str += thickPad;
                    str += '[';
                    str += key;
                    str += '] =>\n';
                    str += thickPad;
                    str += val;
                    str += '\n';
                }
            }
            str += basePad + '}\n';
        } else
        {
            str = _getInnerVal( obj, thickPad );
        }
        return str;
    }

    output = _formatArray( arguments[ 0 ], 0, padVal, padChar );
    for ( i = 1; i < arguments.length; i++ )
    {
        output += '\n' + _formatArray( arguments[ i ], 0, padVal, padChar );
    }

    echo( output );

    // Not how PHP does it, but helps us test:
    return output;
}

/*
    ----- Find whether the type of a variable is integer -----
    //   example 1: is_int(23)
    //   returns 1: true
    //   example 2: is_int('23')
    //   returns 2: false
    //   example 3: is_int(23.5)
    //   returns 3: false
    //   example 4: is_int(true)
    //   returns 4: false
*/
__Var.is_int = function ( mixedVar )
{
    return mixedVar === +mixedVar && isFinite( mixedVar ) && !( mixedVar % 1 );
}


function getOuterHTML(e) {
  console.log(e);
}

/* Console.log function */
function dd ()
{
    let arg = arguments;
    for ( let i = 0; i < arg.length; i++ )
    {
        __Var.var_dump( arg[ i ] );
    }
}


function ddd ( e )
{
    let arg = arguments;
    for ( let i = 0; i < arg.length; i++ )
    {
        console.log( arg[ i ] );
    }
}


function convertRuby ( text )
{
    const regex = /{{(.+?):(.+?)}}/g;
    const replacement = '<ruby>$1<rt>$2</rt></ruby>';
    return text.replace( regex, replacement );
}


function sanitizeHTML(input) {
  let doc = new DOMParser().parseFromString(input, "text/html");

  function filterNodes(node) {
    for (let child of [...node.childNodes]) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName !== "RUBY" && child.tagName !== "RT" && child.tagName !== "INPUT") {
          let textNode = document.createTextNode(child.outerHTML);
          node.replaceChild(textNode, child);
        } else {
          filterNodes(child);
        }
      }
    }
  }

  filterNodes(doc.body);

  return doc.body.innerHTML;
}


function getParent ( e, parentClassName )
{
    if ( !e ) return;
    var _parent = e.parentElement;

    while ( _parent )
    {
        if ( _parent.matches( parentClassName ) ) return _parent;
        else _parent = _parent.parentElement;
    }
}

// 記事タイプ
function toggleHidden ()
{
    // 記事タイプ input 
    var ip_string = 'input[name="smart-custom-fields[post_type_{0}][0]"]{1}',
        pr_class = '.smart-cf-meta-box-table',
        dnone = 'dpl-none',

        pt_url = document.querySelector( ip_string.format( 'url', '' ) ),
        pt_url_parent = getParent( pt_url, pr_class ),

        pt_file = document.querySelector( ip_string.format( 'file', '' ) ),
        pt_file_parent = getParent( pt_file, pr_class );

    // hidden url + file
    document.querySelectorAll( ip_string.format( 'url', `, ${ ip_string.format( 'file', '' ) }` ) ).forEach( e => getParent( e, pr_class ).classList.add( dnone ) );

    var ip_checked = document.querySelector( ip_string.format( 'type', ':checked' ) )?.value || '';
    if ( ip_checked === 'リンク' ) pt_url_parent.classList.remove( dnone );
    else if ( ip_checked === 'ファイル' ) pt_file_parent.classList.remove( dnone );
}


function setActiveCheckbox(e){
    let _this       = e;
    let par         = getParent(e, 'ul');
    let checkeds    = par.querySelectorAll('.checked');
    let checkedAll  = par.querySelector('.checkedall');
    if(_this.classList.contains('checkedall')) checkeds.forEach(e => e.checked = _this.checked);
    else checkedAll.checked = [...checkeds].every(e => e.checked);
}
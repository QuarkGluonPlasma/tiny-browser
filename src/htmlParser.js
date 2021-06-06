const startTagReg = /^<([a-zA-Z0-9\-]+)(?:([ ]+[a-zA-Z0-9\-]+=[^> ]+))*>/;
const attributeReg = /^(?:[ ]+([a-zA-Z0-9\-]+=[^> ]+))/;
const endTagReg = /^<\/([a-zA-Z0-9\-]+)>/;
const commentReg = /^<!\-\-[^(-->)]*\-\->/;
const docTypeReg = /^<!doctype [^>]+>/;

function parse(html, options) {
    function advance(num) {
        html = html.slice(num);
    }
    
    while(html){
        if(html.startsWith('<')) {
            const commentMatch = html.match(commentReg);
            if (commentMatch) {
                options.onComment({
                    type: 'comment',
                    value: commentMatch[0]
                })
                advance(commentMatch[0].length);
                continue;
            }

            const docTypeMatch = html.match(docTypeReg);
            if (docTypeMatch) {
                options.onDoctype({
                    type: 'docType',
                    value: docTypeMatch[0]
                });
                advance(docTypeMatch[0].length);
                continue;
            }

            const endTagMatch = html.match(endTagReg);
            if (endTagMatch) {
                options.onEndTag({
                    type: 'tagEnd',
                    value: endTagMatch[1]
                });
                advance(endTagMatch[0].length);
                continue;
            }

            const startTagMatch = html.match(startTagReg);
            if(startTagMatch) {    
                options.onStartTag({
                    type: 'tagStart',
                    value: startTagMatch[1]
                });

                advance(startTagMatch[1].length + 1);
                let attributeMath;
                while(attributeMath = html.match(attributeReg)) {
                    options.onAttribute({
                        type: 'attribute',
                        value: attributeMath[1]
                    });
                    advance(attributeMath[0].length);
                }
                advance(1);
                continue;
            }
        } else {
            let textEndIndex = html.indexOf('<');
            options.onText({
                type: 'text',
                value: html.slice(0, textEndIndex)
            });
            textEndIndex = textEndIndex === -1 ? html.length: textEndIndex;
            advance(textEndIndex);
        }
    }
}

module.exports = function htmlParser(str) {
    const ast = {
        children: []
    };
    let curParent = ast;
    let prevParent = null;
    const domTree = parse(str,{
        onComment(node) {
        },
        onStartTag(token) {
            const tag = {
                tagName: token.value,
                attributes: [],
                text: '',
                children: []
            };
            curParent.children.push(tag);
            prevParent = curParent;
            curParent = tag;
        },
        onAttribute(token) {
            const [ name, value ] = token.value.split('=');
            curParent.attributes.push({
                name,
                value: value.replace(/^['"]/, '').replace(/['"]$/, '')
            });
        },
        onEndTag(token) {
            curParent = prevParent;
        },
        onDoctype(token) {
        },
        onText(token) {
            curParent.text = token.value;
        }
    });
    return ast.children[0];
}
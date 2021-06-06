const htmlParser = require('./htmlParser');

const domTree = htmlParser(`
<!doctype html>
<body>
    <div>
        <!--button-->
        <button>按钮</button>
        <div id="container">
            <div class="box1">
                <p>box1 box1 box1</p>
            </div>
            <div class="box2">
                <p>box2 box2 box2</p>
            </div>
        </div>
    </div>
</body>
`);

console.log(JSON.stringify(domTree, null, 4));

module.exports = function(RED) {
    function multiClick(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.triggerProperty = config.triggerProperty;
        node.eventDown = config.eventDown;
        node.eventUp = config.eventUp;
        node.timeout = config.timeout;

        // idle -> down1 -> up -> timeout = single press
        // idle -> down1 -> timeout = held
            // held -> up  = released
        // idle -> down1 -> up -> down2 -> up = double-press
        node.state = "idle"
        node.last_event = 0;
        function stateMachine(msg, send, done) 
        {
            console.log(msg[node.triggerProperty]);
            console.log(" state:" + node.state);

            console.log(" !idle:" + (node.state != "idle"));
            
            if(msg.timeout)
            {
                console.log(" " + 1);
                switch(node.state)
                {
                    case "up":
                        node.send([msg,,,]);
                        node.state = "idle";
                        break;
                    case "down1":
                        node.send([,,msg,]);
                        node.state = "held";
                        break;
                    default:
                        node.state = "idle";
                        break;
                }
            }
            else if (msg[node.triggerProperty] == node.eventDown)
            {
                console.log(" " + 2);
                switch(node.state)
                {
                    case "idle":
                        node.state = "down1";
                        setTimeout(function() {
                            msg.timeout = true;
                            stateMachine(msg, send, done);
                        }, node.timeout);
                        break;
                    case "up":
                        node.send([,msg,,]);
                        node.state = "idle";
                        break;
                }
            }
            else if (msg[node.triggerProperty] == node.eventUp)
            {
                console.log(" " + 3);
                switch(node.state)
                {
                    case "down1":
                        node.state = "up";
                        setTimeout(function() {
                            msg.timeout = true;
                            stateMachine(msg, send, done);
                        }, node.timeout);
                        break;
                    case "held":
                        node.send([,,,msg]);
                        node.state = "idle";
                        break;
                }
            }
        }

        node.on('input', stateMachine);
    }
    RED.nodes.registerType("multi click", multiClick);
}

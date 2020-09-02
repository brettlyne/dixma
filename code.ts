figma.showUI(__html__);
figma.ui.resize(300, 600);

// figma.closePlugin()
figma.ui.onmessage = (msg) => {
    if (msg.type === "start-game") {
        figma.notify('game start clicked')
    }
}
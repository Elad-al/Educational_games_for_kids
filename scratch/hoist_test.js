function runTest() {
    const _origSwitchView = switchView;
    function switchView(targetView) {
        console.log("first switchView");
        _origSwitchView(targetView);
    }

    function switchView(targetView) {
        console.log("second switchView");
    }

    console.log("typeof _origSwitchView:", typeof _origSwitchView);
    try {
        switchView("test");
    } catch(e) {
        console.error("Error calling switchView:", e.message);
    }
}
runTest();

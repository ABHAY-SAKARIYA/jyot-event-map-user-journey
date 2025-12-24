
// Configuration for the City Map Visuals
export const mapConfig = {
    // 1. The Surrounding City Grid
    city: {
        gridSize: 10,     // Size of the street blocks (smaller = denser city). Default: 10
        streetColor: "#e0e6ed",
        strokeWidth: 0.5,
    },

    // 2. The Central Festival Ground (Park)
    ground: {
        // Dimensions in percentage (0-100) of the total map size
        width: 70,        // Default: 60
        height: 70,       // Default: 60

        // Shape control
        cornerRadius: "2 2 2 2", // 0 = Rectangle, higher = Rounder (Oval/Circle). Default: 20

        // Visuals
        color: "#eef5f2",     // Use a light pleasant color
        borderColor: "#dcece5",
        borderWidth: 1,
    }
};

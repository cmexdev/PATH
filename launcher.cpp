#define _WIN32_WINNT 0x0601
#include <iostream>
#include "windows.h"
#include "WinUser.h"
#include <fstream>
#include <ostream>
#include <istream>
#include <string>

using namespace std;

int main() {
    //For user's information.
    cout << "Starting launcher..." << endl;

    //So the user can identify what this weird console app is.
    cout << "Renaming window..." << endl;
    system("title PATH");

    //An alternative to hiding the cursor.
    //While this does not keep the cursor in that position, it "hides" it.
    cout << "Placing cursor at (1920, 1080)..." << endl;
    SetCursorPos(1920, 1080);

    //Creates a more immersive experience.
    cout << "Setting launcher fullscreen..." << endl;
    SetConsoleDisplayMode(GetStdHandle(STD_OUTPUT_HANDLE), CONSOLE_FULLSCREEN_MODE, 0);

    //Using 'node.exe' so the user does not need to have NodeJS installed.
    //Of course, it is recommended that the user has NodeJS installed.
    cout << "Running index.js..." << endl;
    system("node.exe index.js");

    //This handles whenever PATH crashes or closes.
    cout << "Closing launcher..." << endl;
    system("pause");
    return 0;
}
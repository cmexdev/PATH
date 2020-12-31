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
    cout << "Starting launcher..." << endl;

    cout << "Performing: SYSTEM=>title PATH ..." << endl;
    system("title PATH");

    cout << "Placing cursor at (1920, 1080)..." << endl;
    SetCursorPos(1920, 1080);

    cout << "Setting launcher fullscreen..." << endl;
    SetConsoleDisplayMode(GetStdHandle(STD_OUTPUT_HANDLE), CONSOLE_FULLSCREEN_MODE, 0);

    cout << "Performing: SYSTEM=>node index.js ..." << endl;
    system("node index.js");

    cout << "Closing launcher..." << endl;
    system("pause");
    return 0;
}
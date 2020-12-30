#define _WIN32_WINNT 0x0601
#include <iostream>
#include "windows.h"
#include "WinUser.h"
#include <fstream>
#include <ostream>
#include <istream>
#include <string>

using namespace std;

void setcursor(bool, DWORD);

void setcursor();

int main() {
    cout << "Starting launcher..." << endl;

    cout << "Performing: SYSTEM=>title PATH ..." << endl;
    system("title PATH");

    cout << "Setting launcher fullscreen..." << endl;
    SetConsoleDisplayMode(GetStdHandle(STD_OUTPUT_HANDLE), CONSOLE_FULLSCREEN_MODE, 0);

    cout << "Performing: SYSTEM=>node index.js ..." << endl;
    system("node index.js");

    cout << "Closing launcher..." << endl;
    system("pause");
    return 0;
}

void setcursor(bool visible, DWORD size) {
    //bool visible = 0
    //bool invisible
}


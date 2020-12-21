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
    cout << "Preparing to launch 'PATH'..." << endl;

    cout << "Reading prefs..." << endl;

    ifstream df("game\\config\\fullscreen");
    

    system("title PATH");
    SetConsoleDisplayMode(GetStdHandle(STD_OUTPUT_HANDLE), CONSOLE_FULLSCREEN_MODE, 0);
    system("node index.js");
    return 0;
}

void setcursor(bool visible, DWORD size) {
    //bool visible = 0
    //bool invisible
}


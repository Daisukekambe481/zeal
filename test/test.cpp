#include <iostream>
#include <string>

using namespace std;

class Date {
private:
    int month, day, year;
public:
    void get_date() {
        char slash;
        cout << "   Enter date (mm/dd/yy): ";
        cin >> month >> slash >> day >> slash >> year;
    }

    void show_date() const {
        cout << month << "/" << day << "/" << year;
    }
};

class publication2 {
private:
    string title;
    float price;
    Date publish_date; 
public:
    void get_data() {
        cout << "Enter title: ";
        cin.ignore(); 
        getline(cin, title);
        cout << "Enter price: ";
        cin >> price;
        publish_date.get_date();
    }

    void show_data() const {
        cout << "\nTitle: " << title;
        cout << "\nPrice: $" << price;
        cout << "\nPublish Date: ";
        publish_date.show_date();
    }
};

class book2 : public publication2 {
private:
    int page_count;
public:
    void get_data() {
        publication2::get_data(); 
        cout << "Enter page count: ";
        cin >> page_count;
    }

    void show_data() const {
        publication2::show_data(); 
        cout << "\nPages: " << page_count;
    }
};

class tape2 : public publication2 {
private:
    float play_time;
public:
    void get_data() {
        publication2::get_data();
        cout << "Enter playing time (minutes): ";
        cin >> play_time;
    }

    void show_data() const {
        publication2::show_data(); 
        cout << "\nPlaying time: " << play_time << " mins";
    }
};

int main() {
    book2 my_book;
    tape2 my_tape;

    cout << "--- ENTER BOOK DATA ---" << endl;
    my_book.get_data();

    cout << "\n--- ENTER TAPE DATA ---" << endl;
    my_tape.get_data();

    cout << "\n--- DISPLAYING ALL RECORDS ---" << endl;
    my_book.show_data();
    cout << endl;
    my_tape.show_data();
    cout << endl;

    return 0;
}
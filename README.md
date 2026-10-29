# LMS-school-colleges-

## ADS College learning portal

Students cannot self-register or purchase courses. Set `ADMIN_EMAIL` and a
`ADMIN_PASSWORD` (at least 8 characters) in `server/.env`; on first
connection to the database, the server creates that administrator account if it
does not already exist. The administrator signs in and creates student accounts
from the Admin dashboard by entering the student name, parent/guardian name and
phone, student phone and email, address, and class. Staff do not need to provide
a password. Each account gets a unique generated student number and
the shared temporary password `changepassword`; students must change it before
accessing courses. Student passwords must be at least 8 characters. Admins can
view student details, block or unblock accounts, and delete student or teacher
accounts after confirming the administrator password. Deleting a student also
removes their attendance and progress records. A deleted teacher's courses are
retained under ADS College. Blocked students cannot log in or access protected
college resources. The dashboard shows the count of
enabled student accounts. Admins can also issue teacher accounts from the
teacher form using the same contact details and temporary password. Teachers
receive a unique `ADT` staff ID, must change the temporary password at first
login, and can be blocked or unblocked from the teacher directory.
Accounts created through the old public sign-up flow are not college-issued and
cannot sign in. The configured administrator account remains eligible.

Courses are available to every signed-in student at no cost. Staff can attach
an HTTP or HTTPS PDF/document link to any lesson in the course curriculum, or
write lesson content directly for students to read. A lesson can contain video
or written content.
Students can open their profile to view their class/batch and college account
details, upload or remove a profile picture, and change their password.
Teachers can manage their own courses, record attendance for active students by
class/batch and date, and send notices to one or more batches they teach.
Admins can send notices to selected batches or the whole college. Notices show
the teacher's name or ADS College as the sender. Students can read notices from
the Notices page. Each course is assigned to one class/batch;
students only see courses assigned to their own class, while admins can browse
courses from every teacher and filter the directory by class/batch.
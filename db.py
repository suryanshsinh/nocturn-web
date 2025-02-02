import sqlite3, random, string, hashlib

class Database:
    def __init__(self, url='db.sqlite3'):
        self.conn = sqlite3.connect(url)
        self.c = self.conn.cursor()
    
    def create_tables(self):
        try:
            self.c.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session TEXT NOT NULL UNIQUE,
                    private_key TEXT NOT NULL,
                    seed TEXT DEFAULT NULL
                )
            ''')
            self.conn.commit()
            return {
                'success': True,
                'message': 'Tables created successfully'
            }
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }
    
    def insert_user(self, private_key, seed=None):
        session = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
        try:
            self.c.execute(f'''
                INSERT INTO sessions (session, private_key{'' if seed is None else ', seed'})
                VALUES (?, ?{'' if seed is None else ', ?'})
            ''', (session, private_key) if seed is None else (session, private_key, seed))
            self.conn.commit()
            return {
                'success': True,
                'message': self.conn.total_changes,
                'session': session
            }
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }
    
    def get_user(self, session):
        try:
            self.c.execute('''
                SELECT * FROM sessions WHERE session=?
            ''', (session,))
            user = self.c.fetchone()
            return {
                'success': True,
                'message': user
            }
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }

    def print_all(self):
        try:
            self.c.execute('''
                SELECT * FROM sessions
            ''')
            users = self.c.fetchall()
            return {
                'success': True,
                'message': users
            }
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }

if __name__ == '__main__':
    db = Database()
    print(db.create_tables())
    # print(db.insert_user('private_key'))
    print(db.print_all())
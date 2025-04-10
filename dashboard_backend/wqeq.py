class FileTypeError(TypeError):
    pass


class FileRecursionError(RecursionError):
    pass


class File:
    def __init__(self, name, creation_datetime, content):
        if not isinstance(name, str):
            raise TypeError("File name must be a string")
        if not isinstance(creation_datetime, str):
            raise TypeError("Creation datetime must be a string")
        if not isinstance(content, str):
            raise TypeError("Content must be a string")

        # Проверка даты и времени
        try:
            day, month, year_time = creation_datetime.split('-', 2)
            year, time = year_time.split(' ', 1)
            hours, minutes = time.split(':')

            day = int(day)
            month = int(month)
            year = int(year)
            hours = int(hours)
            minutes = int(minutes)

            # Простые проверки валидности даты
            if month < 1 or month > 12:
                raise ValueError
            if day < 1 or day > 31:
                raise ValueError
            if hours < 0 or hours > 23:
                raise ValueError
            if minutes < 0 or minutes > 59:
                raise ValueError

        except (ValueError, IndexError):
            raise ValueError("Invalid datetime format or value")

        self.name = name
        self.creation_datetime = creation_datetime
        self.content = content
        self.published = False
        self.edited = False
        self.archive = None

    def get_name(self):
        return self.name

    def get_creation_datetime(self):
        return self.creation_datetime

    def get_content(self):
        return self.content

    def publish(self):
        self.published = True

    def is_published(self):
        return self.published

    def edit(self, content):
        if not isinstance(content, str):
            raise TypeError("Content must be a string")
        self.content = content
        self.published = False
        self.edited = True

    def is_edited(self):
        return self.edited

    def extract(self):
        if self.archive is not None:
            self.archive._files.remove(self)
            self.archive = None

    def __lt__(self, other):
        if isinstance(other, ZipFile):
            return self in other._files
        return False

    def __gt__(self, other):
        if isinstance(other, ZipFile):
            return self in other._files
        return False

    def __repr__(self):
        return f"File({self.name!r}, {self.creation_datetime!r}, {repr(self.archive)})"

    def __str__(self):
        return f"[{self.name} ({self.creation_datetime})]\n{self.content}\n"


class ZipFile(File):
    def __init__(self, name, creation_datetime):
        super().__init__(name, creation_datetime, "")
        self._files = []

    def _check_recursion(self, file, seen=None):
        if seen is None:
            seen = set()

        if file in seen:
            return True

        if isinstance(file, ZipFile):
            seen.add(file)
            for f in file._files:
                if self._check_recursion(f, seen):
                    return True
            seen.remove(file)

        return False

    def wrap(self, file):
        if not isinstance(file, (File, ZipFile)):
            raise FileTypeError("Can only wrap File or ZipFile objects")

        if file is self or self._check_recursion(file):
            raise FileRecursionError("Cannot wrap a file into itself")

        if file.archive is not None:
            file.archive._files.remove(file)
        file.archive = self
        self._files.append(file)

    def get_files(self):
        return self._files.copy()

    def __ilshift__(self, file):
        self.wrap(file)
        return self

    def __lt__(self, other):
        if isinstance(other, ZipFile):
            return any(f == self or (isinstance(f, ZipFile) and f < other) for f in other._files)
        return False

    def __gt__(self, other):
        if isinstance(other, File):
            return other in self._files or any(isinstance(f, ZipFile) and f > other for f in self._files)
        return False

    def __repr__(self):
        return f"ZipFile({self.name!r}, {self.creation_datetime!r})"

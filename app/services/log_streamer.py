import queue

class LogStreamer:
    def __init__(self):
        self.listeners = []

    def push(self, message):
        for q in self.listeners:
            q.put(message)

    def listen(self):
        q = queue.Queue(maxsize=100)
        self.listeners.append(q)
        return q

    def remove_listener(self, q):
        if q in self.listeners:
            self.listeners.remove(q)

log_streamer = LogStreamer()

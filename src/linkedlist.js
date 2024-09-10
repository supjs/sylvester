export class LinkedList {
  constructor() {
    this.length = 0;
    this.first = null;
    this.last = null;
  }

  forEach(fn, context = undefined) {
    let node = this.first,
      n = this.length;
    for (let i = 0; i < n; i++) {
      fn.call(context, node, i);
      node = node.next;
    }
  }

  at(i) {
    if (!(i >= 0 && i < this.length)) {
      return null;
    }
    let node = this.first;
    while (i--) {
      node = node.next;
    }
    return node;
  }

  randomNode() {
    let n = Math.floor(Math.random() * this.length);
    return this.at(n);
  }

  toArray() {
    let arr = [],
      node = this.first,
      n = this.length;
    while (n--) {
      arr.push(node.data || node);
      node = node.next;
    }
    return arr;
  }
}

LinkedList.prototype.each = LinkedList.prototype.forEach;

export class LinkedListNode {
  constructor(data) {
    this.prev = null;
    this.next = null;
    this.data = data;
  }
}

export class CircularLinkedList extends LinkedList {
  static fromArray(list, useNodes) {
    let linked = new CircularLinkedList();
    let n = list.length;
    while (n--) {
      linked.prepend(useNodes ? new LinkedListNode(list[n]) : list[n]);
    }
    return linked;
  }

  append(node) {
    if (this.first === null) {
      node.prev = node;
      node.next = node;
      this.first = node;
      this.last = node;
    } else {
      node.prev = this.last;
      node.next = this.first;
      this.first.prev = node;
      this.last.next = node;
      this.last = node;
    }
    this.length++;
  }

  prepend(node) {
    if (this.first === null) {
      this.append(node);
      return;
    } else {
      node.prev = this.last;
      node.next = this.first;
      this.first.prev = node;
      this.last.next = node;
      this.first = node;
    }
    this.length++;
  }

  insertAfter(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    node.next.prev = newNode;
    node.next = newNode;
    if (newNode.prev === this.last) {
      this.last = newNode;
    }
    this.length++;
  }

  insertBefore(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    node.prev.next = newNode;
    node.prev = newNode;
    if (newNode.next === this.first) {
      this.first = newNode;
    }
    this.length++;
  }

  remove(node) {
    if (this.length > 1) {
      node.prev.next = node.next;
      node.next.prev = node.prev;
      if (node === this.first) {
        this.first = node.next;
      }
      if (node === this.last) {
        this.last = node.prev;
      }
    } else {
      this.first = null;
      this.last = null;
    }
    node.prev = null;
    node.next = null;
    this.length--;
  }

  withData(data) {
    let nodeFromStart = this.first,
      nodeFromEnd = this.last,
      n = Math.ceil(this.length / 2);
    while (n--) {
      if (nodeFromStart.data === data) {
        return nodeFromStart;
      }
      if (nodeFromEnd.data === data) {
        return nodeFromEnd;
      }
      nodeFromStart = nodeFromStart.next;
      nodeFromEnd = nodeFromEnd.prev;
    }
    return null;
  }
}

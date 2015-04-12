mt's Chatroom Protocol
============

mt's Chatroom is a chatroom that I had written in 2010.
I was in the third grade in junior high school at that time.
The program was originally coded in Visual Basic 6.0.

Protocol Version <a id="protocol_version" href="#protocol_version">#</a>
------------

    Version = 1 ( = 0x01 = 0000 0001 )

Use Port
------------

    Server Port = 42581
    Client Port = 43581 - 43599 ( use the smallest if possible )

Socket Structure <a id="socket_structure" href="#socket_structure">#</a>
------------

                  4 bytes                 1 byte          1 byte
    +-------------------------------+---------------+---------------+
    |     M      T      C      R    | Protocol Ver  |   T  y  p  e  |
    +-------------------------------+---------------+---------------+
    |     D    a    t    a       S    e    c    t    i    o    n    |
    +---------------------------------------------------------------+
                             0 or more bytes
    
                                   Server to Client
    +------+------------------------------------------------------------+----------------------+-------+
    | Type | Data Section                                               | Description          | Color |
    +------+------------------------------------------------------------+----------------------+-------+
    | 0x00 | [L,1]<Latest Client Version> [L,1]<Current Server Version> | Get Versions         |     0 |
    | 0x10 | (None)                                                     | Successed to Join    |     0 |
    | 0x11 | (None)                                                     | Failed to Join       |     0 |
    | 0x20 | (None)                                                     | Password Required    |     0 |
    | 0x21 | (None)                                                     | Password Incorrect   |     0 |
    | 0x30 | [ID,1] [L,1]<Nickname>                                     | Someone Joined       |     0 |
    | 0x31 | [ID,1]                                                     | Someone Leaved       |     0 |
    | 0x40 | [ID,1] [L,1]<New Nickname>                                 | Nickname Changed     |     0 |
    | 0x41 | (None)                                                     | Nickname Change Okay |     0 |
    | 0x42 | (None)                                                     | Nickname Invalid     |     0 |
    | 0x50 | [ID,1] [C,1] [L,2]<Message>                                | Send Message         | 2 ~ 6 |
    | 0x51 | [FR,1] [TO,1] [C,1] [L,2]<Message>                         | Send Private Message | 2 ~ 6 |
    | 0x52 | (None)                                                     | Send Private Okay    |     0 |
    | 0x53 | (None)                                                     | Send Private Failed  |     0 |
    | 0x54 | [L,2]<Message>                                             | Serverside Send      |     1 |
    | 0x55 | [L,2]<Message>                                             | Serverside Private   |     1 |
    | 0x60 | [N,1] ([ID,1] [L,1]<Nickname>)n                            | Online List          |     0 |
    | 0xFF | Sorry but I could not understand what you want to do.      | Cannot Understand    |     - |
    +------+------------------------------------------------------------+----------------------+-------+
    
                                   Client to Server
    +------+------------------------------------------------------------+----------------------+
    | Type | Data Section                                               | Description          |
    +------+------------------------------------------------------------+----------------------+
    | 0x00 | (None)                                                     | Get Versions         |
    | 0x10 | [L,1]<Nickname>                                            | Join to chatroom     |
    | 0x20 | [L,1]<Password>                                            | Password for Join    |
    | 0x40 | [L,1]<New Nickname>                                        | Change Nickname      |
    | 0x50 | [C,1] [L,2]<Message>                                       | Send Message         |
    | 0x51 | [TO,1] [C,1] [L,2]<Message>                                | Send Private Message |
    | 0x60 | (None)                                                     | Get Online List      |
    +------+------------------------------------------------------------+----------------------+
    
    [A,B] A = Stand for, B = Bytes
    
    A:  L  = Length of the following string
        C  = Color ID (Reference to Color List)
        ID = User ID
        FR = User ID that private message from
        TO = User ID that the target of private message
        N  = the amount of Online List

Color Set <a id="color_set" href="#color_set">#</a>
------------

    +----+---------+-----------------+----------+--------------------+
    | ID | #RRGGBB | ( r ,  g ,  b ) | VB6Color | Description        |
    +----+---------+-----------------+----------+--------------------+
    |  0 | #C0C0FF | (192, 192, 255) | &HFFC0C0 | System Information |
    |  1 | #FF8080 | (255, 128, 128) | &H8080FF | System Message     |
    |  2 | #FFC080 | (255, 192, 128) | &H80C0FF | Orange             |
    |  3 | #FFC0FF | (255, 192, 255) | &HFFC0FF | Pink               |
    |  4 | #C0FFFF | (192, 255, 255) | &HFFFFC0 | Skyblue            |
    |  5 | #C0FFC0 | (192, 255, 192) | &HC0FFC0 | Lime               |
    |  6 | #FFFFC0 | (255, 255, 192) | &HC0FFFF | Yellow             |
    +----+---------+-----------------+----------+--------------------+

Copyright <a id="copyright" href="#copyright">#</a>
------------

Copyright &copy; 2010-2013 Ming Tsay. All rights reserved.


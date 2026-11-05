import 'package:flutter/material.dart';
import '../../../../models/user_order.dart';
import '../data/models/requests/fetch_order_messages_request.dart';
import '../data/models/requests/send_order_message_request.dart';
import '../data/models/responses/order_message_model.dart';
import '../data/repositories/orders_repository.dart';

class OrderChatBottomSheet extends StatefulWidget {
  final UserOrder order;
  final String userName;
  final String userPhone;
  final OrdersRepository ordersRepository;

  const OrderChatBottomSheet({
    super.key,
    required this.order,
    this.userName = 'Camsik Customer',
    this.userPhone = '',
    required this.ordersRepository,
  });

  static Future<void> show(
    BuildContext context, {
    required UserOrder order,
    String userName = 'Camsik Customer',
    String userPhone = '',
    OrdersRepository? ordersRepository,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => OrderChatBottomSheet(
        order: order,
        userName: userName,
        userPhone: userPhone,
        ordersRepository: ordersRepository ?? OrdersRepositoryImpl(),
      ),
    );
  }

  @override
  State<OrderChatBottomSheet> createState() => _OrderChatBottomSheetState();
}

class _OrderChatBottomSheetState extends State<OrderChatBottomSheet> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<OrderMessageModel> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _fetchMessages();
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages() async {
    try {
      final res = await widget.ordersRepository.fetchOrderMessages(
        FetchOrderMessagesRequest(
          orderId: widget.order.id,
          orderNumber: widget.order.orderNumber,
        ),
      );

      if (res.data != null && res.data['messages'] is List) {
        final list = (res.data['messages'] as List)
            .map((item) => OrderMessageModel.fromJson(item as Map<String, dynamic>))
            .toList();
        if (mounted) {
          setState(() {
            _messages.clear();
            _messages.addAll(list);
            _isLoading = false;
          });
          _scrollToBottom();
        }
        return;
      }
    } catch (_) {}

    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSendMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    _textController.clear();
    setState(() => _isSending = true);

    // Optimistic message
    final tempMsg = OrderMessageModel(
      id: 'local-${DateTime.now().millisecondsSinceEpoch}',
      orderId: widget.order.id,
      orderNumber: widget.order.orderNumber,
      senderRole: 'user',
      senderName: widget.userName,
      senderPhone: widget.userPhone,
      recipientRole: 'delivery',
      text: text,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(tempMsg);
    });
    _scrollToBottom();

    try {
      final res = await widget.ordersRepository.sendOrderMessage(
        SendOrderMessageRequest(
          orderId: widget.order.id,
          orderNumber: widget.order.orderNumber,
          senderRole: 'user',
          senderName: widget.userName,
          senderPhone: widget.userPhone,
          recipientRole: 'delivery',
          text: text,
        ),
      );

      if (res.data != null && res.data['message'] != null) {
        final confirmedMsg = OrderMessageModel.fromJson(res.data['message'] as Map<String, dynamic>);
        if (mounted) {
          setState(() {
            _messages.removeLast();
            _messages.add(confirmedMsg);
          });
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Message delivery notice: $e'),
            backgroundColor: const Color(0xFFDC2626),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSending = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.support_agent, color: Color(0xFF059669), size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Doorstep Chat: ${widget.order.orderNumber}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'Delivery Agent & Hub Support · ${widget.order.device}',
                        style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, size: 20, color: Color(0xFF64748B)),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Messages View
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                : _messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.chat_bubble_outline, size: 40, color: Colors.grey.shade400),
                            const SizedBox(height: 8),
                            const Text(
                              'No messages yet',
                              style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Ask your pickup agent or tech hub about slot timing.',
                              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (ctx, idx) {
                          final msg = _messages[idx];
                          final isUser = msg.isUserSender;

                          return Align(
                            alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              constraints: BoxConstraints(
                                maxWidth: MediaQuery.of(context).size.width * 0.78,
                              ),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isUser ? const Color(0xFF059669) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(14),
                                  topRight: const Radius.circular(14),
                                  bottomLeft: Radius.circular(isUser ? 14 : 2),
                                  bottomRight: Radius.circular(isUser ? 2 : 14),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment:
                                    isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        isUser ? 'You' : msg.senderName,
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 10,
                                          color: isUser ? Colors.white70 : const Color(0xFF475569),
                                        ),
                                      ),
                                      if (!isUser) ...[
                                        const SizedBox(width: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: msg.senderRole == 'delivery'
                                                ? const Color(0xFFEDE9FE)
                                                : const Color(0xFFE0F2FE),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            msg.senderRole.toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 8,
                                              fontWeight: FontWeight.bold,
                                              color: msg.senderRole == 'delivery'
                                                ? const Color(0xFF7C3AED)
                                                : const Color(0xFF0284C7),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    msg.text,
                                    style: TextStyle(
                                      color: isUser ? Colors.white : const Color(0xFF0F172A),
                                      fontSize: 12.5,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${msg.timestamp.hour.toString().padLeft(2, '0')}:${msg.timestamp.minute.toString().padLeft(2, '0')}',
                                    style: TextStyle(
                                      fontSize: 9,
                                      color: isUser ? Colors.white60 : const Color(0xFF94A3B8),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Message Input Field
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    onSubmitted: (_) => _handleSendMessage(),
                    decoration: InputDecoration(
                      hintText: 'Type a message to pickup agent...',
                      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: const BorderSide(color: Color(0xFF059669), width: 1.5),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: const CircleBorder(),
                  ),
                  onPressed: _isSending ? null : _handleSendMessage,
                  icon: _isSending
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Icon(Icons.send, size: 18),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

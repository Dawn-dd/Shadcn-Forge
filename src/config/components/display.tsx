import { ComponentConfig, CardProps, AvatarProps, BadgeProps, SeparatorProps, Theme, ComponentItem } from '@/types';
import { Box, User, Tag, Minus } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const displayComponents: Record<string, ComponentConfig> = {
  Card: {
    name: '卡片 (Card)',
    icon: <Box size={14} />,
    category: 'Display',
    defaultProps: {
      title: '数据报告',
      description: '基于您的使用情况生成的智能摘要。'
    },
    render: (props, theme?: Theme, _layout?: any, item?: ComponentItem) => {
      const cardProps = props as unknown as CardProps;
      const styleFromItem = item?.style || {};
      const mergedStyle: any = {
        backgroundColor: styleFromItem.backgroundColor ?? theme?.background,
        borderColor: styleFromItem.borderColor ?? theme?.border,
        borderRadius: styleFromItem.borderRadius !== undefined ? `${styleFromItem.borderRadius}px` : (theme ? `${theme.radius}px` : undefined),
        borderWidth: styleFromItem.borderWidth !== undefined ? `${styleFromItem.borderWidth}px` : (theme?.borderWidth ? `${theme.borderWidth}px` : undefined),
        padding: styleFromItem.padding !== undefined ? `${styleFromItem.padding}px` : undefined,
        color: styleFromItem.color ?? undefined,
        width: styleFromItem.width === 'full' ? '100%' : (styleFromItem.width === 'auto' || !styleFromItem.width ? undefined : styleFromItem.width)
      };
       return (
         <Card 
          className="w-full"
          style={mergedStyle}
         >
          <CardHeader>
            <CardTitle style={{ color: theme?.foreground }}>
              {cardProps.title}
            </CardTitle>
            {cardProps.description && (
              <CardDescription style={{ color: theme?.mutedForeground }}>
                {cardProps.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
      );
    }
  },

  Avatar: {
    name: '头像 (Avatar)',
    icon: <User size={14} />,
    category: 'Display',
    defaultProps: {
      fallback: 'SF',
      src: '',
      size: 'default'
    },
    propSchema: {
      size: { type: 'select', options: ['sm', 'default', 'lg'] }
    },
    render: (props, theme?: Theme, _layout?: any, item?: ComponentItem) => {
      const avatarProps = props as unknown as AvatarProps;
      const sizeClasses: Record<AvatarProps['size'], string> = {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12'
      };
      
      const styleFromItem = item?.style || {};
      const mergedStyle: any = {
        backgroundColor: styleFromItem.backgroundColor ?? theme?.primary,
        color: (styleFromItem.color ?? (theme?.primaryForeground || '#ffffff')),
        borderRadius: styleFromItem.borderRadius !== undefined ? `${styleFromItem.borderRadius}px` : undefined,
        width: sizeClasses[avatarProps.size].split(' ')[1]
      };

      return (
        <Avatar className={sizeClasses[avatarProps.size]} style={{ backgroundColor: mergedStyle.backgroundColor }}>
          {avatarProps.src && <AvatarImage src={avatarProps.src} alt={avatarProps.fallback} />}
          <AvatarFallback 
            style={{ color: mergedStyle.color }}
          >
            {avatarProps.fallback}
          </AvatarFallback>
        </Avatar>
      );
    }
  },

  Badge: {
    name: '徽章 (Badge)',
    icon: <Tag size={14} />,
    category: 'Display',
    defaultProps: {
      text: 'New Feature',
      variant: 'default'
    },
    propSchema: {
      variant: {
        type: 'select',
        options: ['default', 'secondary', 'destructive', 'outline']
      }
    },
    render: (props, theme?: Theme, _layout?: any, item?: ComponentItem) => {
      const badgeProps = props as unknown as BadgeProps;
      const styleFromItem = item?.style || {};
      const mergedStyle: any = {
        backgroundColor: styleFromItem.backgroundColor ?? (badgeProps.variant === 'default' ? theme?.primary : undefined),
        color: styleFromItem.color ?? (badgeProps.variant === 'default' ? (theme?.primaryForeground || '#ffffff') : theme?.foreground),
        borderRadius: styleFromItem.borderRadius !== undefined ? `${styleFromItem.borderRadius}px` : (theme ? `${theme.radius}px` : undefined),
        borderColor: styleFromItem.borderColor ?? (badgeProps.variant === 'outline' ? theme?.border : undefined),
        borderWidth: styleFromItem.borderWidth !== undefined ? `${styleFromItem.borderWidth}px` : undefined,
        padding: styleFromItem.padding !== undefined ? `${styleFromItem.padding}px` : undefined,
        fontSize: styleFromItem.fontSize !== undefined ? `${styleFromItem.fontSize}px` : undefined
      };
       return (
        <Badge 
          variant={badgeProps.variant}
          style={mergedStyle}
        >
          {badgeProps.text}
        </Badge>
       );
     }
   },

  Separator: {
    name: '分割线 (Separator)',
    icon: <Minus size={14} />,
    category: 'Display',
    defaultProps: {
      orientation: 'horizontal'
    },
    propSchema: {
      orientation: { type: 'select', options: ['horizontal', 'vertical'] }
    },
    render: (props, theme?: Theme) => {
      const separatorProps = props as unknown as SeparatorProps;
      return (
        <div className="w-full py-4">
          <Separator 
            orientation={separatorProps.orientation}
            style={{ backgroundColor: theme?.border }}
          />
        </div>
      );
    }
  }
};